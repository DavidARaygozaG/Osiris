/**
 * Filtro SVG que deforma suavemente lo que hay detrás del cristal (refracción líquida).
 * Se usa con `backdrop-filter: url(#liquid)` (ver globals.css, clase .lq: solo Chrome/Edge/Android).
 */
export default function LiquidDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
      <filter id="liquid" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.013" numOctaves="2" seed="7" result="ruido" />
        <feGaussianBlur in="ruido" stdDeviation="2.2" result="suave" />
        <feDisplacementMap in="SourceGraphic" in2="suave" scale="26" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
