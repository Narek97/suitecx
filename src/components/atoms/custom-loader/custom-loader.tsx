import './custom-loader.scss';
import { memo } from 'react';

const CustomLoader = memo(() => {
  return (
    <div className={'custom-loader'} data-testid={'custom-loader-test-id'}>
      <div className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
});

export default CustomLoader;
