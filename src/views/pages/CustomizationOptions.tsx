import React from 'react';
import type { Order, Topping, Size } from '@/models/types';
import { SUGAR_LEVELS, ICE_LEVELS } from '@/models/constants';
import OptionSelector from '../components/OptionSelector';
import { SugarIcon, IceIcon, SizeIcon, ToppingIcon } from '../../views/assets/icons';
import { formatVND } from '../../utils/formatting';

interface CustomizationOptionsProps {
  order: Order;
  toppings?: Topping[];
  sizes?: Size[];
  onToppingChange: (topping: Topping) => void;
  onSizeChange: (size: Size) => void;
  onSugarChange: (sugar: string) => void;
  onIceChange: (ice: string) => void;
}

const CustomizationOptions: React.FC<CustomizationOptionsProps> = ({
  order,
  toppings,
  sizes,
  onToppingChange,
  onSizeChange,
  onSugarChange,
  onIceChange,
}) => {
  const SINGLE_SIZE_CATEGORIES = ['fruit-tea', 'cafe', 'latte'];
  const productHasMultipleSizes = order.product && !SINGLE_SIZE_CATEGORIES.includes(order.product.category);

  // Use provided toppings/sizes or fall back to constants
  const availableToppings = toppings || [];
  const availableSizes = sizes || [];

  return (
    <div className="space-y-10">
      <OptionSelector<Topping>
        title="2. Chọn Topping"
        icon={<ToppingIcon />}
        options={availableToppings}
        selectedOptions={order.toppings}
        onChange={onToppingChange}
        isMultiSelect
        getOptionLabel={(option) => `${option.name} (+${formatVND(option.price)})`}
        getOptionValue={(option) => option.id}
      />
      {productHasMultipleSizes && (
        <OptionSelector<Size>
          title="3. Chọn Size"
          icon={<SizeIcon />}
          options={availableSizes}
          selectedOptions={order.size ? [order.size] : []}
          onChange={onSizeChange}
          getOptionLabel={(option) => `${option.name} ${option.priceModifier > 0 ? `(+${formatVND(option.priceModifier)})` : ''}`}
          getOptionValue={(option) => option.id}
        />
      )}
      <OptionSelector<string>
        title={productHasMultipleSizes ? "4. Điều Chỉnh Đường" : "3. Điều Chỉnh Đường"}
        icon={<SugarIcon />}
        options={SUGAR_LEVELS}
        selectedOptions={order.sugar ? [order.sugar] : []}
        onChange={onSugarChange}
      />
      <OptionSelector<string>
        title={productHasMultipleSizes ? "5. Chọn Mức Đá" : "4. Chọn Mức Đá"}
        icon={<IceIcon />}
        options={ICE_LEVELS}
        selectedOptions={order.ice ? [order.ice] : []}
        onChange={onIceChange}
      />
    </div>
  );
};

export default CustomizationOptions;