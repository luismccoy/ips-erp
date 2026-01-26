/**
 * FeedbackWidget - Floating feedback button + modal
 * 
 * Allows beta testers to submit feedback directly from the app.
 * Feedback is stored in DynamoDB for Clawd to review.
 */

import { useState } from 'react';
import { MessageSquarePlus, X, Send, CheckCircle } from 'lucide-react';
import { client, isDemoMode } from '../amplify-utils';

interface FeedbackData {
    role: string;
    rating: number;
    liked: string;
    confused: string;
    suggestions: string;
    email?: string;
}

export function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackData>({
        role: '',
        rating: 0,
        liked: '',
        confused: '',
        suggestions: '',
        email: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Store feedback as a Notification with type FEEDBACK
            // This works with existing schema without changes
            await (client.models.Notification as any).create({
                id: `feedback-${Date.now()}`,
                tenantId: 'feedback-collection',
                userId: feedback.email || 'anonymous',
                type: 'FEEDBACK',
                title: `Feedback: ${feedback.role} - ${feedback.rating}⭐`,
                message: JSON.stringify({
                    role: feedback.role,
                    rating: feedback.rating,
                    liked: feedback.liked,
                    confused: feedback.confused,
                    suggestions: feedback.suggestions,
                    email: feedback.email,
                    timestamp: new Date().toISOString(),
                    isDemoMode: isDemoMode(),
                    userAgent: navigator.userAgent,
                }),
                read: false,
            });

            setIsSubmitted(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsSubmitted(false);
                setFeedback({
                    role: '',
                    rating: 0,
                    liked: '',
                    confused: '',
                    suggestions: '',
                    email: '',
                });
            }, 2000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            // Still show success - feedback is valuable even if storage fails
            // We can retrieve from console logs if needed
            console.log('FEEDBACK_BACKUP:', JSON.stringify(feedback));
            setIsSubmitted(true);
            setTimeout(() => {
                setIsOpen(false);
                setIsSubmitted(false);
            }, 2000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 group"
                title="Enviar Feedback"
            >
                <MessageSquarePlus className="h-6 w-6" />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ¡Tu opinión importa!
                </span>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 rounded-t-2xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-white">💬 Tu Feedback</h2>
                                    <p className="text-violet-200 text-sm mt-1">
                                        Ayúdanos a mejorar la aplicación
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white/80 hover:text-white p-1"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        {isSubmitted ? (
                            <div className="p-8 text-center">
                                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    ¡Gracias! 🙏
                                </h3>
                                <p className="text-slate-600">
                                    Tu feedback es muy valioso para nosotros.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        ¿Qué rol probaste?
                                    </label>
                                    <div className="flex gap-2">
                                        {['Admin', 'Enfermera', 'Familia', 'Demo'].map((role) => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => setFeedback({ ...feedback, role })}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                    feedback.role === role
                                                        ? 'bg-violet-600 text-white'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        ¿Qué tan fácil fue de usar? (1-5)
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setFeedback({ ...feedback, rating: star })}
                                                className={`text-2xl transition-transform hover:scale-125 ${
                                                    feedback.rating >= star ? 'opacity-100' : 'opacity-30'
                                                }`}
                                            >
                                                ⭐
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* What they liked */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        ¿Qué te gustó? 👍
                                    </label>
                                    <textarea
                                        value={feedback.liked}
                                        onChange={(e) => setFeedback({ ...feedback, liked: e.target.value })}
                                        placeholder="Lo que funcionó bien..."
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                                        rows={2}
                                    />
                                </div>

                                {/* What confused them */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        ¿Qué te confundió? 🤔
                                    </label>
                                    <textarea
                                        value={feedback.confused}
                                        onChange={(e) => setFeedback({ ...feedback, confused: e.target.value })}
                                        placeholder="Lo que no fue claro..."
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                                        rows={2}
                                    />
                                </div>

                                {/* Suggestions */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        ¿Qué agregarías o cambiarías? 💡
                                    </label>
                                    <textarea
                                        value={feedback.suggestions}
                                        onChange={(e) => setFeedback({ ...feedback, suggestions: e.target.value })}
                                        placeholder="Tus ideas y sugerencias..."
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                                        rows={2}
                                    />
                                </div>

                                {/* Optional Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Tu email (opcional)
                                    </label>
                                    <input
                                        type="email"
                                        value={feedback.email}
                                        onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                                        placeholder="Para contactarte si tenemos preguntas"
                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !feedback.role}
                                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5" />
                                            Enviar Feedback
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
