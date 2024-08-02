import { FC, useCallback } from 'react';

import './style.scss';

import PersonaImages from '@/components/templates/persona-images';
import { SelectedPersonasViewModeEnum } from '@/utils/ts/enums/global-enums';
import { PersonaType } from '@/utils/ts/types/persona/persona-types';

interface ISelectedPersonas {
  viewMode: SelectedPersonasViewModeEnum;
  personas: PersonaType[];
  showActives: boolean;
  showFullItems?: boolean;
  disabled?: boolean;
  updatePersonas?: (id: number) => void;
}

const JourneyMapSelectedPersonas: FC<ISelectedPersonas> = ({
  viewMode,
  personas,
  showActives,
  showFullItems = false,
  disabled,
  updatePersonas,
}) => {
  const handleSelectJourneyMapFooter = useCallback(
    (id: number) => {
      updatePersonas && updatePersonas(id);
    },
    [updatePersonas],
  );

  return (
    <>
      <div className="persona-add-images">
        <PersonaImages
          viewMode={viewMode}
          showFullItems={showFullItems}
          handleSelectPersonaItem={showActives && !disabled ? handleSelectJourneyMapFooter : null}
          personas={personas}
          disabled={disabled}
        />
      </div>
    </>
  );
};

export default JourneyMapSelectedPersonas;
