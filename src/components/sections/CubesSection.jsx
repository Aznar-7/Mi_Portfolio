import Cubes from '../background/Cubes';
import { SectionWrapper } from '../common/SectionWrapper';

export const CubesSection = () => {
  return (
    <SectionWrapper id="interact" className="overflow-hidden">
      <div className="flex flex-col items-center justify-center relative w-full h-full z-10">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Interactúa
        </h2>
        <p className="text-white/60 mb-10 max-w-lg text-center text-base sm:text-lg px-2">
          Arrastra el cursor sobre los cubos o haz click para crear un efecto de ondulación interactivo.
        </p>

        <div className="w-full mx-auto flex justify-center items-center" style={{ maxWidth: '600px', height: 'clamp(260px, 55vw, 400px)' }}>
          <Cubes
            gridSize={8}
            maxAngle={45}
            radius={3}
            borderStyle="2px dashed rgba(177, 158, 239, 0.4)"
            faceColor="#1a1a2e"
            rippleColor="#8b5cf6"
            rippleSpeed={1.5}
            autoAnimate={true}
            rippleOnClick={true}
          />
        </div>
      </div>
    </SectionWrapper>
  );
};
