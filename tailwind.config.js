module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        colors: {
          'blue-900': '#003399', // Custom dark blue for navigation/buttons
          'blue-800': '#002B80', // Slightly lighter for hover
          'blue-500': '#3B82F6', // Standard blue
          'blue-600': '#2563EB', // Standard blue hover
          'green-500': '#22C55E',
          'green-600': '#16A34A',
          'red-500': '#EF4444',
          'red-600': '#DC2626',
        },
      },
    },
    plugins: [],
}
  