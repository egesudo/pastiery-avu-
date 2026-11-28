import React from 'react';
import type { ProductCategory } from '../../data/products';
import { Icon, type IconName } from '../ui/IconRegistry';

export interface CategoryIconProps {
  isActive?: boolean;
  className?: string;
}

export const CATEGORY_ICON_NAME_MAP: Record<ProductCategory, IconName> = {
  'yas-pasta': 'yas-pasta',
  'ekler-ibiza': 'ekler-ibiza',
  'kuru-pasta': 'kuru-pasta',
  'sutlu-tatlilar': 'sutlu-tatli',
};

export const YasPastaIcon: React.FC<CategoryIconProps> = React.memo(
  ({ isActive = false, className = '' }) => (
    <Icon
      name="yas-pasta"
      size={20}
      variant="duotone"
      className={className}
      style={isActive ? { ['--icon-accent' as string]: 'var(--icon-vanilya)' } : undefined}
    />
  )
);
YasPastaIcon.displayName = 'YasPastaIcon';

export const EklerIcon: React.FC<CategoryIconProps> = React.memo(
  ({ isActive = false, className = '' }) => (
    <Icon
      name="ekler-ibiza"
      size={20}
      variant="duotone"
      className={className}
      style={isActive ? { ['--icon-accent' as string]: 'var(--icon-karamel)' } : undefined}
    />
  )
);
EklerIcon.displayName = 'EklerIcon';

export const KuruPastaIcon: React.FC<CategoryIconProps> = React.memo(
  ({ className = '' }) => (
    <Icon name="kuru-pasta" size={20} variant="duotone" className={className} />
  )
);
KuruPastaIcon.displayName = 'KuruPastaIcon';

export const SutluTatliIcon: React.FC<CategoryIconProps> = React.memo(
  ({ className = '' }) => (
    <Icon name="sutlu-tatli" size={20} variant="duotone" className={className} />
  )
);
SutluTatliIcon.displayName = 'SutluTatliIcon';

export const CATEGORY_ICON_MAP: Record<ProductCategory, React.FC<CategoryIconProps>> = {
  'yas-pasta': YasPastaIcon,
  'ekler-ibiza': EklerIcon,
  'kuru-pasta': KuruPastaIcon,
  'sutlu-tatlilar': SutluTatliIcon,
};
