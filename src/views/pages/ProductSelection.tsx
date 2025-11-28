import React, { useState, useMemo } from 'react';
import type { Product } from '@/models/types';
import { CATEGORIES } from '@/models/constants';
import { CheckIcon } from '@/views/assets/icons';
import { formatVND } from '@/utils/formatting';

interface ProductSelectionProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  selectedProductId?: number;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isLoading: boolean;
}

const ProductCard: React.FC<{ product: Product; onSelect: () => void; isSelected: boolean }> = ({ product, onSelect, isSelected }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <button
      onClick={onSelect}
      className={`relative w-full text-left rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-4 ${isSelected ? 'border-amber-500 scale-105 shadow-xl' : 'border-transparent'}`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 bg-amber-500 rounded-full p-1.5 shadow-lg animate-fade-in-pop">
          <CheckIcon className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}
      <div className="relative w-full h-48 bg-stone-100">
        {/* Skeleton Loader */}
        <div
          className={`w-full h-full bg-stone-200 animate-pulse transition-opacity duration-500 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
        />
        {/* Image */}
        <img
          src={product.image}
          alt={product.name}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>
      <div className="p-4 bg-white">
        <h3 className="font-bold text-lg text-stone-700">{product.name}</h3>
        <p className="text-amber-600 font-semibold mt-1">{formatVND(product.price)}</p>
      </div>
    </button>
  );
};

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="w-full rounded-xl overflow-hidden border-4 border-transparent bg-white shadow-md">
      <div className="w-full h-48 bg-stone-200 animate-pulse" />
      <div className="p-4">
        <div className="h-5 bg-stone-200 rounded w-3/4 mb-3 animate-pulse"></div>
        <div className="h-4 bg-stone-200 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  );
};

const CategoryButtonSkeleton: React.FC = () => (
  <div className="h-[36px] w-24 rounded-full bg-stone-200 animate-pulse"></div>
);


const ProductSelection: React.FC<ProductSelectionProps> = ({ products, onProductSelect, selectedProductId, selectedCategory, onCategoryChange, isLoading }) => {

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return products;
    }
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-stone-700">1. Chọn Thức Uống</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-stone-600 mb-4">Chọn Danh Mục</h3>
        {isLoading ? (
          <div className="flex flex-wrap gap-3">
            {[...Array(4)].map((_, i) => <CategoryButtonSkeleton key={i} />)}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onCategoryChange('all')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 border-2 ${selectedCategory === 'all'
                ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                : 'bg-white border-stone-200 text-stone-700 hover:border-amber-400 hover:text-amber-600'
                }`}
            >
              Tất Cả
            </button>
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 border-2 ${isSelected
                    ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-amber-400 hover:text-amber-600'
                    }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={() => onProductSelect(product)}
              isSelected={selectedProductId === product.id}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductSelection;
