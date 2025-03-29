module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkNavbarColour: '#120b3d', // Custom color
        darkCardColour: '#120B3D', // Custom color
        darkFilterColour: '#422AD5', // Custom color
        darkText: '#A1B1FF',
        darkBackground: '#09002f'
      },
      
    },
  },
  plugins: [require("flowbite/plugin")],
}