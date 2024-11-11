# Welcome to GeoPointer!🎉

GeoPointer is a game that allows you to explore the places around you which you may or may not know already, who knows you might find a hidden gem around you?
Try it out [HERE](https://geopointer.netlify.app/)

## How to run the files

1. Clone the repository to your local machine using:
```
git clone https://github.com/Daddycation23/GeoPointer
```
2. Navigate to the project directory:
```
cd geoquest
```
3. Install the dependencies:
```
npm install
```
4. Start the development server:
```
npm start
```

### How to play the game

1. Edit your name in the home page, and click on the button to start the game.
![Alt text](./public/HomePage.png "Home Page")
2. The Street View image of the targetted location will be shown, and the map below is where all the markers can be seen, as well as your guess marker.
![Alt text](./public/StreetViewAndMap.png "Street View and Map")
3. Below are the color indications of the markers.
![Alt text](./public/ColorIndications.png "Color Indications")
4. When 'show hint' is clicked, a circle of 1km radius will be shown, and the target location will be somewhere within the circle.
![Alt text](./public/Hint.png "Hint")
5. You can switch between 2D and 3D view, as well as Street View using the Pegman icon.
![Alt text](./public/2DView.png "2D View")
![Alt text](./public/3DView.png "3D View")
![Alt text](./public/StreetView.png "Street View")
6. You have 3 guesses to guess the location, and the points will be calculated based on how close you are to the actual location. The scores are shown in the main page.
7. After you have made a correct guess(<=100m) or used all your guesses, the route from your location to the target location will be shown, you may also choose to start new challenge.
![Alt text](./public/QuestDone.png "Quest Done")

Feel free to explore the code and make improvements!
