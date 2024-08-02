import './custom-file-uploader.scss';
import React, { memo, ReactNode } from 'react';

import LinearProgress from '@mui/material/LinearProgress';

import DefaultImage from '@/public/base-icons/default_image.svg';

const CustomFileUploader = memo(
  ({ uploadProgress, content }: { uploadProgress: number; content?: ReactNode }) => {
    return (
      <div className={'custom-file-uploader'} data-testid={'custom-file-uploader'}>
        {uploadProgress ? (
          <div
            className={'custom-file-uploader-progress'}
            data-testid={'custom-file-uploader-progress-test-id'}>
            <div className={'custom-file-uploader-progress-percentage'}>{uploadProgress}%</div>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </div>
        ) : (
          <>
            {content ? (
              content
            ) : (
              <>
                <DefaultImage />
                <p>Add picture</p>
              </>
            )}
          </>
        )}
      </div>
    );
  },
);

export default CustomFileUploader;
