import { DemographicInfoTypeEnum } from '@/gql/types';
import { PersonaDemographicInfoPopoverType } from '@/utils/ts/types/persona/persona-types';

const DEMOGRAPHIC_INFO_POPOVER: Array<PersonaDemographicInfoPopoverType> = [
  { id: 1, name: 'Text field', type: DemographicInfoTypeEnum.Text },
  { id: 2, name: 'Numeric field', type: DemographicInfoTypeEnum.Number },
];

export { DEMOGRAPHIC_INFO_POPOVER };
