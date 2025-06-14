/** @type {import('tailwindcss').Config} */
module.exports = {
    // Specify the files Tailwind should scan for classes
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        // Custom colors, fonts, spacing, etc.
        colors: {
          'blue-900': '#003399', // Custom blue for consistent branding
          'blue-800': '#002B80',
          'blue-700': '#002266',
        },
      },
    },
    plugins: [],
  }
  