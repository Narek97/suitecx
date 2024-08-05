import React, { FC } from 'react';

import './style.scss';

import { Tooltip } from '@mui/material';
import { useSetRecoilState } from 'recoil';

import { copyMapState } from '@/store/atoms/copyMap.atom';
import { CopyMapLevelTemplateEnum } from '@/utils/ts/enums/global-enums';

interface IBoardItem {
  map: { id: number; title: string };
}

const MapItem: FC<IBoardItem> = ({ map }) => {
  const setCopyMapDetailsData = useSetRecoilState(copyMapState);
  return (
    <li
      data-testid={`map-item-test-id-${map?.id}`}
      className={`board-map-item`}
      onClick={() => {
        setCopyMapDetailsData(prev => ({
          ...prev,
          template: CopyMapLevelTemplateEnum.ORGS,
          mapId: map?.id,
          boardId: null,
        }));
      }}>
      <div className={'board-map-item--content`'}>
        <Tooltip title={map?.title} arrow placement={'bottom'}>
          <div className={'board-map-item--content--title'}>{map?.title}</div>
        </Tooltip>
      </div>
    </li>
  );
};

export default MapItem;
