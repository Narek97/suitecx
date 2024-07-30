import React, { FC } from 'react';
import './style.scss';
import { WORKSPACE_ANALYTICS_ITEMS } from '@/utils/constants/workspaces';
import { PinnedOutcomeGroupType } from '@/utils/ts/types/outcome/outcome-type';
import Image from 'next/image';

interface IWorkspaceAnalytics {
  showType?: string;
  fontSize?: string;
  data?: {
    journeyMapCount: number;
    personasCount: number;
  };
  outcomeGroups?: PinnedOutcomeGroupType[];
  pinnedOutcomeGroupCount?: number;
  viewAll?: () => void;
}

const WorkspaceAnalytics: FC<IWorkspaceAnalytics> = ({
  data,
  outcomeGroups,
  fontSize,
  showType,
  viewAll,
  pinnedOutcomeGroupCount,
}) => {
  const onHandleClick = () => {};

  return (
    <ul className={'workspace--analytics'} data-testid="workspace--analytics-test-id">
      {data &&
        WORKSPACE_ANALYTICS_ITEMS(onHandleClick)?.map(item => (
          <li
            className={`workspace--analytics--item ${showType || ''}`}
            key={item?.name}
            onClick={item.onClick}>
            <p className={`workspace--analytics--item--count  ${fontSize || ''} `}>
              {data[item.key] || 0}
            </p>
            <div className={'workspace--analytics--item-description-section'}>
              <div className={'workspace--analytics--item--icon'}>{item.icon}</div>
              {showType !== 'horizontal-type' && <span> {item.name}</span>}
            </div>
          </li>
        ))}
      {outcomeGroups?.map(outcomeItem => (
        <li className={`workspace--analytics--item ${showType || ''}`} key={outcomeItem?.id}>
          <p className={`workspace--analytics--item--count  ${fontSize || ''} `}>
            {outcomeItem.count || 0}
          </p>
          <span className={'workspace--analytics--item--name'}>{outcomeItem?.name}</span>
          <div className={'workspace--analytics--item--icon'}>
            <Image
              src={outcomeItem?.icon}
              alt={'outcome_image'}
              width={12}
              height={12}
              style={{
                width: '12px',
                height: '12px',
              }}
            />
            {/*{showType !== 'horizontal-type' && <span> {item.name}</span>}*/}
          </div>
        </li>
      ))}
      {viewAll &&
        typeof pinnedOutcomeGroupCount === 'number' &&
        pinnedOutcomeGroupCount > 3 &&
        outcomeGroups && (
          <li className={`view-all ${fontSize || ''}`}>
            <button
              onClick={e => {
                e.stopPropagation();
                viewAll();
              }}>
              +{pinnedOutcomeGroupCount - outcomeGroups.length!}
            </button>
          </li>
        )}
    </ul>
  );
};

export default WorkspaceAnalytics;
