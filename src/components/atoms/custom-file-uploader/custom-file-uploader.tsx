import './custom-file-uploader.scss';
import React, { memo, ReactNode } from 'react';
import DefaultImage from '@/public/base-icons/default_image.svg';
import LinearProgress from '@mui/material/LinearProgress';

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
                <DefaultImage width={26} />
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
