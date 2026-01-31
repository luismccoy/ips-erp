# AWS Transcribe Voice Notes - Kiro IDE Implementation Spec

**Task ID:** T-20260126-003  
**Status:** Ready for Kiro IDE  
**Created:** 2026-01-27  

---

## Overview

Add voice note functionality to IPS-ERP allowing nurses to record audio notes that are automatically transcribed using AWS Transcribe.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Nurse App   │────▶│ S3 Bucket    │────▶│ AWS Transcribe  │
│ (Record)    │     │ (audio/)     │     │ (async job)     │
└─────────────┘     └──────────────┘     └────────┬────────┘
                                                   │
                    ┌──────────────┐     ┌─────────▼────────┐
                    │ DynamoDB     │◀────│ Lambda Trigger   │
                    │ (notes)      │     │ (process result) │
                    └──────────────┘     └──────────────────┘
```

## Implementation Steps

### Step 1: S3 Bucket Setup (CDK)

In `amplify/backend.ts` or a new stack:

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

const voiceNotesBucket = new s3.Bucket(stack, 'VoiceNotesBucket', {
  bucketName: `ips-erp-voice-notes-${stage}`,
  cors: [{
    allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
    allowedOrigins: ['*'], // Restrict in prod
    allowedHeaders: ['*'],
  }],
  lifecycleRules: [{
    expiration: Duration.days(90), // Auto-cleanup old audio
  }],
});
```

### Step 2: Transcribe Lambda Function

Create `amplify/functions/voice-transcribe/handler.ts`:

```typescript
import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const transcribe = new TranscribeClient({ region: 'us-east-1' });

export const handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;
    
    // Start transcription job
    const jobName = `transcribe-${Date.now()}`;
    
    await transcribe.send(new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: 'es-CO', // Colombian Spanish
      Media: {
        MediaFileUri: `s3://${bucket}/${key}`,
      },
      OutputBucketName: bucket,
      OutputKey: `transcripts/${key}.json`,
      Settings: {
        ShowSpeakerLabels: false,
        MaxSpeakerLabels: 1,
      },
    }));
    
    return { jobName, status: 'STARTED' };
  }
};
```

### Step 3: IAM Permissions

Add to the Lambda role:

```typescript
const transcribePolicy = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: [
    'transcribe:StartTranscriptionJob',
    'transcribe:GetTranscriptionJob',
  ],
  resources: ['*'],
});

const s3Policy = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: ['s3:GetObject', 's3:PutObject'],
  resources: [`${voiceNotesBucket.bucketArn}/*`],
});
```

### Step 4: GraphQL Schema Addition

In `amplify/data/resource.ts`:

```typescript
VoiceNote: a.model({
  patientId: a.id().required(),
  nurseId: a.id().required(),
  audioUrl: a.string().required(),
  transcription: a.string(),
  status: a.enum(['RECORDING', 'TRANSCRIBING', 'COMPLETED', 'FAILED']),
  duration: a.integer(), // seconds
  createdAt: a.datetime(),
}).authorization(allow => [
  allow.owner(),
  allow.groups(['Admins', 'Nurses']),
]),
```

### Step 5: Frontend Component

Create `src/components/voice/VoiceNoteRecorder.tsx`:

```typescript
import { useState, useRef } from 'react';
import { uploadData } from 'aws-amplify/storage';

export function VoiceNoteRecorder({ patientId, onComplete }) {
  const [recording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];
    
    mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
    mediaRecorder.current.onstop = handleUpload;
    
    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  const handleUpload = async () => {
    const blob = new Blob(chunks.current, { type: 'audio/webm' });
    const key = `audio/${patientId}/${Date.now()}.webm`;
    
    await uploadData({
      key,
      data: blob,
      options: { contentType: 'audio/webm' }
    });
    
    // Poll for transcription result...
  };

  return (
    <div className="voice-recorder">
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? '⏹️ Stop' : '🎤 Record Note'}
      </button>
      {transcription && <p>{transcription}</p>}
    </div>
  );
}
```

## Environment Variables

```bash
VOICE_NOTES_BUCKET=ips-erp-voice-notes-prod
AWS_REGION=us-east-1
```

## Testing

1. Deploy with `npx ampx sandbox`
2. Record a test audio in Spanish
3. Check S3 for uploaded file
4. Check CloudWatch for Lambda execution
5. Verify transcription appears in DynamoDB

## Cost Estimate

- AWS Transcribe: ~$0.024/minute
- S3 Storage: ~$0.023/GB
- Lambda: Minimal (< $1/month)

For 100 nurses doing 10 notes/day @ 30 sec each:
- ~50 hours audio/month = ~$72/month

---

## Handoff to Kiro IDE

**Start with:**
1. Create the S3 bucket in CDK
2. Create the transcribe Lambda function
3. Add the GraphQL schema
4. Wire up S3 trigger to Lambda

**Luis will:**
- Provide AWS credentials/sandbox access
- Test on the Amplify deployment

**Blocked on:**
- AWS sandbox credentials (Luis needs to provide)
