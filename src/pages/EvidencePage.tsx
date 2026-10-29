import React from 'react';
import { VideoEvidenceRecorder } from '../components/evidence/VideoEvidenceRecorder';

export const EvidencePage: React.FC = () => {
  return (
    <div className="pb-12 max-w-4xl mx-auto">
      <VideoEvidenceRecorder isStandalonePage={true} />
    </div>
  );
};
