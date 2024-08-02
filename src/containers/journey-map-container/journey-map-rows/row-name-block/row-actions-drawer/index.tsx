import React, { FC, useState } from 'react';

import './style.scss';

import Drawer from '@mui/material/Drawer';
import Image from 'next/image';
import { useRecoilValue } from 'recoil';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import ModalHeader from '@/components/templates/modal-header';
import { useAddNewRow } from '@/containers/journey-map-container/helpers/add-new-row';
import { MapRowTypeEnum } from '@/gql/types';
import ConsIcon from '@/public/journey-map/cons.svg';
import ConsInfoIcon from '@/public/journey-map/cons_info.svg';
import DividerIcon from '@/public/journey-map/divider.svg';
import ImageIcon from '@/public/journey-map/image.svg';
import ImageInfoIcon from '@/public/journey-map/image_info.svg';
import InsightsIcon from '@/public/journey-map/insights.svg';
import InteractionIcon from '@/public/journey-map/interaction.svg';
import InteractionInfoIcon from '@/public/journey-map/interaction_info.svg';
import LinkIcon from '@/public/journey-map/link.svg';
import LinksInfoIcon from '@/public/journey-map/links_info.svg';
import ListIcon from '@/public/journey-map/list.svg';
import MetricsIcon from '@/public/journey-map/metrics.svg';
import MetricsInfoIcon from '@/public/journey-map/metrics_info.svg';
import OutcomeInfoIcon from '@/public/journey-map/outcome_info.svg';
import ProsIcon from '@/public/journey-map/pros.svg';
import ProsInfoIcon from '@/public/journey-map/pros_info.svg';
import SentimentIcon from '@/public/journey-map/sentiment.svg';
import SentimentInfoIcon from '@/public/journey-map/sentiment_info.svg';
import TextIcon from '@/public/journey-map/text.svg';
import TouchpointIcon from '@/public/journey-map/touchpoint.svg';
import TouchpointInfoIcon from '@/public/journey-map/touchpoint_info.svg';
import PlusSignIcon from '@/public/operations/plus.svg';
import { mapOutcomesState } from '@/store/atoms/outcomeGroups.atom';
import { ObjectKeysType } from '@/utils/ts/types/global-types';

interface IRowActionsDrawer {
  index: number;
}

const RowActionsDrawer: FC<IRowActionsDrawer> = ({ index }) => {
  const onToggleDrawer = () => {
    setIsOpen(prev => !prev);
  };

  const outcomes = useRecoilValue(mapOutcomesState);

  const { createJourneyMapRow, isLoadingCreateRow } = useAddNewRow(onToggleDrawer);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [infoType, setInfoType] = useState<MapRowTypeEnum | null>(null);

  const analysis = [
    {
      icon: <SentimentIcon />,
      title: 'Sentiment',
      type: MapRowTypeEnum.Sentiment,
    },
    {
      icon: <TouchpointIcon />,
      title: 'Touchpoints',
      type: MapRowTypeEnum.Touchpoints,
    },
    {
      icon: <InteractionIcon />,
      title: 'Interactions',
      type: MapRowTypeEnum.Interactions,
    },
    {
      icon: <ProsIcon />,
      title: 'Pros',
      type: MapRowTypeEnum.Pros,
    },
    {
      icon: <ConsIcon />,
      title: 'Cons',
      type: MapRowTypeEnum.Cons,
    },
    {
      icon: <InsightsIcon />,
      title: 'Insights',
      type: MapRowTypeEnum.Insights,
    },
    {
      icon: <MetricsIcon />,
      title: 'Metrics',
      type: MapRowTypeEnum.Metrics,
    },
  ];
  const contentAndStructure = [
    {
      icon: <DividerIcon />,
      title: 'Divider',
      type: MapRowTypeEnum.Divider,
    },
    {
      icon: <TextIcon />,
      title: 'Text',
      type: MapRowTypeEnum.Text,
    },
    {
      icon: <ListIcon />,
      title: 'List item',
      type: MapRowTypeEnum.ListItem,
    },
    {
      icon: <LinkIcon />,
      title: 'Link lane',
      type: MapRowTypeEnum.Links,
    },
    {
      icon: <ImageIcon />,
      title: 'Image',
      type: MapRowTypeEnum.Image,
    },
  ];
  const planning = outcomes.map(oc => ({
    id: oc.id,
    pluralName: oc.pluralName,
    icon: oc.icon,
    title: oc.name,
    type: MapRowTypeEnum.Outcomes,
  }));

  const infoIcon: ObjectKeysType = {
    [MapRowTypeEnum.Sentiment]: <SentimentInfoIcon />,
    [MapRowTypeEnum.Touchpoints]: <TouchpointInfoIcon />,
    [MapRowTypeEnum.Interactions]: <InteractionInfoIcon />,
    [MapRowTypeEnum.Pros]: <ProsInfoIcon />,
    [MapRowTypeEnum.Cons]: <ConsInfoIcon />,
    [MapRowTypeEnum.Insights]: <TouchpointInfoIcon />,
    [MapRowTypeEnum.Metrics]: <MetricsInfoIcon />,
    [MapRowTypeEnum.Divider]: <TouchpointInfoIcon />,
    [MapRowTypeEnum.Text]: <TouchpointInfoIcon />,
    [MapRowTypeEnum.ListItem]: <TouchpointInfoIcon />,
    [MapRowTypeEnum.Links]: <LinksInfoIcon />,
    [MapRowTypeEnum.Image]: <ImageInfoIcon />,
    [MapRowTypeEnum.Outcomes]: <OutcomeInfoIcon />,
  };

  const onHandleCreateRow = (type: MapRowTypeEnum, additionalFields?: ObjectKeysType) => {
    setInfoType(null);
    createJourneyMapRow(index + 1, type, additionalFields);
  };

  return (
    <div
      className={`row-actions-drawer`}
      onMouseOver={() => {
        setInfoType(null);
      }}>
      <Drawer anchor={'left'} data-testid="drawer-test-id" open={isOpen} onClose={onToggleDrawer}>
        <div className={'row-actions-drawer--info-block'}>{infoType && infoIcon[infoType]}</div>
        {isLoadingCreateRow && (
          <div className={'row-actions-drawer--loading-block'}>
            <CustomLoader />
          </div>
        )}

        <div className={`row-actions-drawer--drawer`}>
          <ModalHeader title={`Add lane`} />

          <div className={`row-actions-drawer--drawer--content`}>
            <ul className={`row-actions-drawer--drawer--groups`}>
              <p className={`row-actions-drawer--drawer--groups-title`}>Analysis</p>
              {analysis.map(row => (
                <li
                  key={row.title}
                  className={`row-actions-drawer--drawer--groups-item`}
                  onClick={() => onHandleCreateRow(row.type)}
                  onMouseOver={e => {
                    setInfoType(row.type);
                    e.stopPropagation();
                  }}>
                  {row.icon}
                  {row.title}
                </li>
              ))}
            </ul>
            <ul className={`row-actions-drawer--drawer--groups`}>
              <p className={`row-actions-drawer--drawer--groups-title`}>Content & structure</p>

              {contentAndStructure.map(row => (
                <li
                  key={row.title}
                  className={`row-actions-drawer--drawer--groups-item`}
                  onClick={() => onHandleCreateRow(row.type)}
                  onMouseOver={e => {
                    setInfoType(row.type);
                    e.stopPropagation();
                  }}>
                  {row.icon}
                  {row.title}
                </li>
              ))}
            </ul>
            {planning.length ? (
              <ul
                className={`row-actions-drawer--drawer--groups row-actions-drawer--drawer--outcome-groups`}>
                <p className={`row-actions-drawer--drawer--groups-title`}>Planning</p>
                {planning.map(row => (
                  <li
                    key={row.id}
                    className={`row-actions-drawer--drawer--groups-item`}
                    onClick={() =>
                      onHandleCreateRow(row.type, { outcomeGroupId: row.id, label: row.pluralName })
                    }
                    onMouseOver={e => {
                      setInfoType(row.type);
                      e.stopPropagation();
                    }}>
                    <Image
                      src={row.icon}
                      alt="Logo"
                      width={200}
                      height={200}
                      style={{
                        width: 16,
                        height: 16,
                      }}
                    />
                    {row.pluralName || row.title}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </Drawer>

      <button aria-label={'Add'} className={`row-actions-drawer--button`} onClick={onToggleDrawer}>
        <PlusSignIcon />
      </button>
    </div>
  );
};

export default RowActionsDrawer;
