import { useState, type ChangeEvent } from 'react';

type ValidationRule<T> = {
    [K in keyof T]?: (value: T[K]) => string | null;
}

export function useForm<T>(initialValues: T, validationRules?: ValidationRule<T>) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        // Handle numbers properly if input type is number
        const newValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;

        setValues(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Clear error when user starts typing
        if (errors[name as keyof T]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validate = (): boolean => {
        if (!validationRules) return true;

        const newErrors: Partial<Record<keyof T, string>> = {};
        let isValid = true;

        (Object.keys(values as object) as Array<keyof T>).forEach(key => {
            const validator = validationRules[key];
            if (validator) {
                const error = validator(values[key]);
                if (error) {
                    newErrors[key] = error;
                    isValid = false;
                }
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const reset = () => {
        setValues(initialValues);
        setErrors({});
        setIsSubmitting(false);
    };

    return {
        values,
        errors,
        isSubmitting,
        setIsSubmitting,
        handleChange,
        validate,
        reset,
        setValues // Exposed for manual updates if needed
    };
}
