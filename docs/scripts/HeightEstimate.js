/*
 * Purpose: This file is designed to calculate the height and distance of objects from the user using data obtained from a device's sensors based on its orientation.
 * Team   : 190
 * Authors: Andrew Pang Yong Chen
 *	    Angel Ern Tang
 *          Hong Xiang Huan
 *          Yong Kim Chim
*/

//global vars
const TO_DEGREE = (180/Math.PI);
let userHeight = 1;
let baseAngle = null;
let topAngle = null;
let firstTime = true;

//mdl snackbar selector
let notification = document.querySelector('.mdl-js-snackbar');
let calculateButton = document.getElementById("calculateButton");


// Feature 1: Sensing Device Orientation

try {

  // Create a variable devSensor(device sensor) to store the object from class Absolute Orientation Sensor
	var deviceSensor =  new AbsoluteOrientationSensor();

  // If there is error, devSensor will give back error
	deviceSensor.onerror = reportError;

  // Get the coordinates from devSensor via user function getCoordinates()
	deviceSensor.addEventListener('reading',() => getCoordinates(deviceSensor));

  // Starts the sensor
  deviceSensor.start();

} catch (error) {

	console.log(error);

}

setUserHeight(firstTime);

// This function displays the text "error" in the table cell beside the Current Tilt
function reportError()
{

	document.getElementById("deviceTilt").innerHTML = "error";

}

// getCoordinates()
//
// This function takes the values of the unit quartenion describing the device orientation and computes the current device tilt or beta angle using trigonometric formulas
//
// argument: theSensor: this represents the variable containing the instance of the AbsoluteOrientationSensor class
//
// returns:
//      This function returns an array containing the beta angle of the device
//
function getCoordinates(theSensor){

	let coordinateData = smoothen(theSensor);

	let x_coordinate = coordinateData.x_value;   // x coordinate from coordinate data
	let y_coordinate = coordinateData.y_value;   // y coordinate from coordinate data
	let z_coordinate = coordinateData.z_value;   // z coordinate from coordinate data
	let vector_e = coordinateData.e_value;       // vector e from coordinate data

	let data = [];
	data[0] = Math.atan2(2*(vector_e*x_coordinate + y_coordinate*z_coordinate), 1 - 2*(Math.pow(x_coordinate,2)+Math.pow(y_coordinate,2)));

	document.getElementById("deviceTilt").innerHTML = "beta: " + (data[0]*TO_DEGREE).toFixed(0) + "°";
	return data[0];

}

// Feature 2: Smoothing Sensor Data

// smoothen()
// This function smoothens the data describing the device orientation. It does this by calculating the average of the last 1000 sensor values of the device orientation. it uses
// the .quaternion method from the Orientation Sensor API which returns a four-element array containing the unit quartenion describing the device orientation.
//
// argument: theSensor: this represents the variable containing the instance of the AbsoluteOrientationSensor class
//
// returns:
//      This function returns the average unit quartenion describing the device orientation of 1000 sensor values
//
function smoothen(theSensor){

	let count = 0;
	let x_cummulative = 0;
	let y_cummulative = 0;
	let z_cummulative = 0;
	let e_cummulative = 0;
	let data_size = 1000;

  // summing up 1000 sensor values of each component of the unit quartenion
	while (count < data_size){
		x_cummulative += theSensor.quaternion[0];
		y_cummulative += theSensor.quaternion[1];
		z_cummulative += theSensor.quaternion[2];
		e_cummulative += theSensor.quaternion[3];
		count++;

	}

	return {

		x_value:x_cummulative/data_size,
		y_value:y_cummulative/data_size,
		z_value:z_cummulative/data_size,
		e_value:e_cummulative/data_size

	};

}

//Feature 3: Set Camera Height

// This function prompts the user for the height of the device from the ground.
function setUserHeight(firstTime = false){

	let newHeight;

	//loops until valid height input
	do{
		newHeight = prompt("Enter Your Height in metres (Reference Height): ",userHeight);

		if(isNaN(newHeight)  || newHeight<0 || newHeight == null){
			alert("invalid height");
		}

	}while(isNaN(newHeight)|| newHeight<0 || newHeight == null);

	//update HTML and global var
	userHeight = newHeight;
	document.getElementById("heightOfCamera").innerHTML = userHeight + "m";

	//mdl snackbar
	if(!firstTime){
		var data = {
  			message: 'Height Recorded',
  			timeout: 2000
		};
		notification.MaterialSnackbar.showSnackbar(data);
	}

	if (topAngle != null && baseAngle != null){
		calculateButton.disabled = false;
   	}

}

// Feature 4: Record Tilt Angles

// This function records the current beta angle of the device when the "bottom" is tapped
function setBaseAngle(){

	baseAngle = getCoordinates(deviceSensor);
	document.getElementById("baseAngle").innerHTML = (baseAngle*TO_DEGREE).toFixed(2) + "°";

	//mdl snackbar
	var data = {
  	message: 'Base Angle Recorded',
  	timeout: 2000
	};
	notification.MaterialSnackbar.showSnackbar(data);

	if (topAngle != null){
		calculateButton.disabled = false;
  	}

}

// This function records the current beta angle of the device when the "top" button is tapped
function setTopAngle(){

	topAngle = getCoordinates(deviceSensor);
	document.getElementById("topAngle").innerHTML = (topAngle*TO_DEGREE).toFixed(2) + "°";

	//mdl snackbar
	var data = {
  	message: 'Top Angle Recorded',
  	timeout: 2000
	};
	notification.MaterialSnackbar.showSnackbar(data);

	if (baseAngle != null){
		calculateButton.disabled = false;
  	}

}

// Feature 5: Calculate the Distance to the object
// Feature 6: Calculate the Height to the object

// This function computes the height and distance from the device of the object intended for height estimation
function doCalculation(){

	let distOut = document.getElementById("distanceOfObject");
	let heightOut = document.getElementById("heightOfObject");

	let objectDistance = parseFloat(userHeight) * Math.tan(baseAngle);
	let differenceOfAngle = topAngle - Math.PI/2 ;
	let objectHeight = parseFloat(userHeight) + objectDistance * Math.tan(differenceOfAngle);

	if(objectHeight>0 && objectDistance>0){
		distOut.innerHTML = objectDistance.toFixed(2) + "m";
		heightOut.innerHTML = objectHeight.toFixed(2)+"m";
	}
	else if (baseAngle>topAngle){
		alert("Base level should not be higher than top level");
	}
	else if(topAngle>baseAngle){
		alert("Object's base level cannot be higher than the referenced height's base level");
	}
	calculateButton.disabled = true;

}
