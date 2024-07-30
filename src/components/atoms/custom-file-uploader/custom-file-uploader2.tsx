import { FC } from 'react';
import './custom-file-uploader.scss';
import  FileUploaderIcon  from '@/public/base-icons/file-uploader.svg';

interface ICustomFileUploader2 {
  title?: string;
}

const CustomFileUploader2: FC<ICustomFileUploader2> = ({ title = 'Choose file' }) => {
  return (
    <div className={'custom-file-uploader2'} data-testid={'custom-file-uploader2'}>
      <div className={'custom-file-uploader2--content'}>
        <p className={'custom-file-uploader2--title'}>Drag your file here</p>
        <div className={'custom-file-uploader2--btn'}>
          <FileUploaderIcon />
          <div className={'custom-file-uploader2--btn-title'}>{title}</div>
        </div>
      </div>
    </div>
  );
};

export default CustomFileUploader2;
