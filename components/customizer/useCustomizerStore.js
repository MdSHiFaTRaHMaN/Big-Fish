import { create } from "zustand";

export const useCustomizerStore = create((set) => ({
  activeTab: "designs",
  setActiveTab: (tab) => set({ activeTab: tab }),

  qty: 1,
  setQty: (qty) =>
    set((s) => ({ qty: typeof qty === "function" ? qty(s.qty) : qty })),

  selectedDesign: "throw",
  setSelectedDesign: (design) => set({ selectedDesign: design }),

  currentView: "front",
  setCurrentView: (view) => set({ currentView: view }),

  uploadedLogos: [],
  setUploadedLogos: (logos) =>
    set((s) => ({
      uploadedLogos: typeof logos === "function" ? logos(s.uploadedLogos) : logos,
    })),

  uploadedImages: [],
  setUploadedImages: (images) =>
    set((s) => ({
      uploadedImages: typeof images === "function" ? images(s.uploadedImages) : images,
    })),

  uploadSubTab: "logo",
  setUploadSubTab: (tab) => set({ uploadSubTab: tab }),

  textLayers: [],
  setTextLayers: (layers) =>
    set((s) => ({
      textLayers: typeof layers === "function" ? layers(s.textLayers) : layers,
    })),

  selectedLayerId: "front-text",
  setSelectedLayerId: (id) => set({ selectedLayerId: id }),

  logoLayers: [],
  setLogoLayers: (layers) =>
    set((s) => ({
      logoLayers: typeof layers === "function" ? layers(s.logoLayers) : layers,
    })),

  selectedLogoId: null,
  setSelectedLogoId: (id) => set({ selectedLogoId: id }),

  loadedLogoImages: {},
  setLoadedLogoImages: (images) =>
    set((s) => ({
      loadedLogoImages:
        typeof images === "function" ? images(s.loadedLogoImages) : images,
    })),

  isEraserMode: false,
  setIsEraserMode: (mode) =>
    set((s) => ({
      isEraserMode: typeof mode === "function" ? mode(s.isEraserMode) : mode,
    })),

  eraserBrushSize: 20,
  setEraserBrushSize: (size) => set({ eraserBrushSize: size }),

  layersOrder: [],
  setLayersOrder: (order) =>
    set((s) => ({
      layersOrder: typeof order === "function" ? order(s.layersOrder) : order,
    })),

  draggedIdx: null,
  setDraggedIdx: (idx) => set({ draggedIdx: idx }),

  dragOverIdx: null,
  setDragOverIdx: (idx) => set({ dragOverIdx: idx }),

  activePatternSide: "Front",
  setActivePatternSide: (side) => set({ activePatternSide: side }),

  state: {
    primary: "#2196F3",
    primaryColorSide: "Both",
    primaryFront: "#2196F3",
    primaryBack: "#2196F3",
    secondary: "#1A1A2E",
    designColor: "#1A1A2E",
    pattern: "None",
    fabricPatternFront: "None",
    fabricPatternBack: "None",
    fabricPatternCustomizeFront: false,
    fabricPatternColorFront: "#d73099",
    fabricPatternBgFront: "#FFFFFF",
    fabricPatternCustomizeBack: false,
    fabricPatternColorBack: "#d73099",
    fabricPatternBgBack: "#FFFFFF",
    frontText: "",
    frontFont: "Varsity",
    frontTextColor: "#FFFFFF",
    frontTextSize: 220,
    backText: "",
    backFont: "Varsity",
    backTextColor: "#FFFFFF",
    backTextSize: 200,
    number: "10",
    numberFont: "Bold",
    numberColor: "#111111",
    numberPosition: "Both",
    sleeve: "Short",
    collarType: "None",
    cutFit: "None",
    fabric: "Mesh",
    collar: false,
    zipper: false,
    designSide: "Both",
    logo: null,
    logoPosition: "Left Chest",
    logoSize: 0.15,
    logoPosX: 0.065,
    logoPosY: 0.16,
    logoPosZ: 0.15,
    logoRotX: 0,
    logoRotY: 0,
    logoRotZ: 0,
    logoInteractive: true,
  },
  setState: (updater) =>
    set((s) => ({
      state: typeof updater === "function" ? updater(s.state) : { ...s.state, ...updater },
    })),
  updateState: (key, value) =>
    set((s) => ({
      state: { ...s.state, [key]: value },
    })),

  loadedPatterns: {},
  setLoadedPatterns: (patterns) =>
    set((s) => ({
      loadedPatterns:
        typeof patterns === "function" ? patterns(s.loadedPatterns) : patterns,
    })),

  dynamicShapes: [],
  setDynamicShapes: (shapes) => set({ dynamicShapes: shapes }),

  snapX: null,
  setSnapX: (x) => set({ snapX: x }),
  snapY: null,
  setSnapY: (y) => set({ snapY: y }),
  snapType: null,
  setSnapType: (type) => set({ snapType: type }),
}));
