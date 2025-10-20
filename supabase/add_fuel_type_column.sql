-- fuel_type 컬럼 추가
ALTER TABLE public.power_plants 
ADD COLUMN fuel_type VARCHAR(50);

-- 컬럼에 대한 설명 추가
COMMENT ON COLUMN public.power_plants.fuel_type IS '발전소 연료 타입 (LNG, 석탄, 바이오매스, 중유 등)';
