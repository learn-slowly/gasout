-- activity_posts 테이블에 power_plant_id 컬럼 추가
ALTER TABLE public.activity_posts 
ADD COLUMN power_plant_id UUID REFERENCES public.power_plants(id);

-- 컬럼에 대한 설명 추가
COMMENT ON COLUMN public.activity_posts.power_plant_id IS '연결된 발전소 ID';
