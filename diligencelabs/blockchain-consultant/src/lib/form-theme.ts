// Modern, visually stunning form theme - Senior UX/UI Design
// Glassmorphic design with sophisticated color palette and enhanced UX

export const formTheme = {
  // Container styles
  container: "bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-0",
  modalOverlay: "fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto",
  modalContainer: "w-full max-w-4xl max-h-[98vh] sm:max-h-[90vh] overflow-y-auto my-2 sm:my-4",
  
  // Card styles - Modern Glassmorphism
  card: {
    base: "bg-gradient-to-br from-slate-900/40 to-slate-800/60 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/20 ring-1 ring-white/5",
    bordered: "bg-slate-900/30 backdrop-blur-xl border border-white/20 shadow-xl shadow-black/10",
    hover: "hover:border-white/20 hover:shadow-3xl hover:shadow-purple-500/10 transition-all duration-500 hover:scale-[1.02]"
  },
  
  // Input styles - Modern, clean with better focus states
  input: {
    base: "bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400 rounded-xl h-12 px-4 focus:border-white/60 focus:ring-2 focus:ring-white/10 focus:bg-white/10 transition-all duration-300 hover:border-white/30",
    error: "border-red-400/60 focus:border-red-400 focus:ring-red-400/20 bg-red-500/5",
    disabled: "bg-slate-800/30 border-slate-700/50 text-slate-500 cursor-not-allowed opacity-60"
  },
  
  // Select styles - Enhanced glassmorphism
  select: {
    trigger: "bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl h-12",
    content: "bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl",
    item: "hover:bg-white/10 focus:bg-white/10 text-slate-200 rounded-lg mx-1",
    itemSelected: "bg-slate-600/30 text-white"
  },
  
  // Textarea styles - Consistent with inputs
  textarea: {
    base: "bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400 rounded-xl p-4 focus:border-white/60 focus:ring-2 focus:ring-white/10 focus:bg-white/10 transition-all duration-300 hover:border-white/30 min-h-[120px] resize-none",
    error: "border-red-400/60 focus:border-red-400 focus:ring-red-400/20 bg-red-500/5"
  },
  
  // Button styles - Modern, attention-grabbing
  button: {
    primary: "bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl px-8 py-3 shadow-lg shadow-slate-700/30 hover:shadow-xl hover:shadow-slate-600/40 transform hover:scale-[1.02] transition-all duration-300 active:bg-slate-800 border border-white/10",
    secondary: "bg-white/5 backdrop-blur-sm border border-white/20 text-white font-medium rounded-xl px-8 py-3 hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02]",
    danger: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-xl px-8 py-3 shadow-lg shadow-red-600/25",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-4 py-2 transition-all duration-300",
    disabled: "bg-slate-700/50 text-slate-500 cursor-not-allowed opacity-50 rounded-xl"
  },
  
  // Label styles - Modern typography
  label: {
    base: "text-slate-200 font-medium text-sm tracking-wide mb-2 block",
    required: "after:content-['*'] after:ml-1 after:text-red-400 after:font-bold"
  },
  
  // Form message styles - Enhanced visibility
  formMessage: {
    error: "text-red-400 text-sm mt-2 font-medium flex items-center gap-2",
    success: "text-emerald-400 text-sm mt-2 font-medium flex items-center gap-2",
    info: "text-blue-400 text-sm mt-2 font-medium flex items-center gap-2"
  },
  
  // Badge styles - Modern glassmorphic badges
  badge: {
    default: "bg-slate-700/50 backdrop-blur-sm border border-white/10 text-slate-300 rounded-full px-3 py-1",
    primary: "bg-gradient-to-r from-blue-600/90 to-cyan-600/90 backdrop-blur-sm border border-cyan-400/20 text-white rounded-full px-3 py-1 shadow-lg",
    success: "bg-gradient-to-r from-emerald-600/90 to-teal-600/90 backdrop-blur-sm border border-emerald-400/20 text-white rounded-full px-3 py-1 shadow-lg",
    warning: "bg-gradient-to-r from-amber-600/90 to-orange-600/90 backdrop-blur-sm border border-amber-400/20 text-white rounded-full px-3 py-1 shadow-lg",
    danger: "bg-gradient-to-r from-red-600/90 to-rose-600/90 backdrop-blur-sm border border-red-400/20 text-white rounded-full px-3 py-1 shadow-lg",
    purple: "bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm border border-purple-400/20 text-white rounded-full px-3 py-1 shadow-lg"
  },
  
  // Section styles - Enhanced hierarchy
  section: {
    header: "border-b border-white/10 pb-6 mb-8",
    title: "text-xl font-bold text-white mb-3 tracking-tight",
    description: "text-slate-400 leading-relaxed"
  },
  
  // Feature box styles - Modern glassmorphic containers
  featureBox: {
    base: "bg-gradient-to-br from-purple-600/10 to-indigo-600/10 backdrop-blur-sm rounded-2xl p-8 border border-purple-400/20 shadow-xl",
    title: "text-xl font-bold text-white mb-6 tracking-tight"
  },
  
  // Animation classes - Enhanced micro-interactions
  animation: {
    fadeIn: "animate-fadeIn",
    slideUp: "animate-slideUp",
    spinner: "animate-spin rounded-full h-6 w-6 border-2 border-purple-400/30 border-t-purple-400",
    pulse: "animate-pulse",
    bounce: "animate-bounce"
  },
  
  // Gradient borders - Modern accent borders
  gradientBorder: {
    primary: "bg-gradient-to-r from-purple-600 to-indigo-600 p-[1px] rounded-2xl",
    success: "bg-gradient-to-r from-emerald-500 to-teal-500 p-[1px] rounded-2xl",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500 p-[1px] rounded-2xl",
    danger: "bg-gradient-to-r from-red-500 to-rose-500 p-[1px] rounded-2xl"
  },
  
  // Loading states - Enhanced UX
  loading: {
    overlay: "absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center",
    spinner: "w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"
  }
}

// Helper function to combine classes
export function combineClasses(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Modern form field wrapper styles - Enhanced UX
export const formFieldStyles = {
  wrapper: "space-y-3 relative group",
  inputWrapper: "relative overflow-hidden",
  errorIcon: "absolute right-4 top-1/2 -translate-y-1/2 text-red-400 w-5 h-5",
  successIcon: "absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5",
  loadingIcon: "absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-purple-400",
  floatingLabel: "absolute left-4 top-3 text-slate-400 text-sm transition-all duration-200 pointer-events-none group-focus-within:-translate-y-1 group-focus-within:text-xs group-focus-within:text-purple-400"
}

// Modern spacing system - Enhanced visual hierarchy
export const formSpacing = {
  section: "space-y-8",
  fields: "space-y-6", 
  fieldGroup: "space-y-4",
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-8",
  grid3: "grid grid-cols-1 md:grid-cols-3 gap-8",
  grid4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
  buttonGroup: "flex flex-col sm:flex-row gap-4 pt-8",
  cardPadding: "p-8 sm:p-10",
  headerSpacing: "mb-8",
  footerSpacing: "mt-10"
}