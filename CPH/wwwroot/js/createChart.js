import * as Plot from "https://cdn.skypack.dev/@observablehq/plot@0.4";
/**
 * 
 * Vue.js V2
 * https://v2.vuejs.org/v2/api/
 * 
 * */
const ChartAttributes = new Vue({
	el: '#Chart',
	//****
	//---------------------------------------
	//					<<[driver variables for processing chart creation]>>
	// countiesDiv - References the HTML element for displaying the list of counties
	// chartArea - References the HTML element for displaying the percentile chart
	// year - Holds the selected file's year
	// dataHolder - Holds the selected file's identifying data - i.e., 'Aleutians East Borough', 'AK', '2013', '13'
	// healthAttribute - holds a string of the user selected health attribute
	// healthAttributeData - Holds the data values and percentiles of the selected health attribute - i.e., 1.096147823363608, 0
	// fullRawData - Holds the selected file's unprocessed data as individual rows within an array
	// selectedCounties - An array that holds all user selected counties
	// previousCounties - An array that holds all user selected counties from the previous in iteration
	// presentCounties -  An array that holds all counties that have a health attribute with a value greater than 0
	// absentCounties - An array that holds all counties that have a health attribute with a value less than 1
	// marks - Holds the charts draw data
	// plot - Holds the plot
	//---------------------------------------
	//					<<[Variables for hiding/displaying elements]>>
	// displayLegend - Boolean; enables/disables display of the list of selected items
	// displayFilter - Boolean; enables/disables display of the list of elements for specifying type of health indicator to display
	// displayHealthAttribute - Boolean; enables/disables display of the entire list of health indicators
	// displayZeroList - Boolean; enables/disables display of the list of items with zero values
	// tempHide - DEBUG hide element used to hide region, until finished
	//---------------------------------------
	//					<<[Aggregation variables]>>
	// maxValue - Holds the selected column or rows max value
	// minValue - Holds the selected column or rows minimum value
	//---------------------------------------
	//					<<[Filtering variables]>>
	// filterAttributeOptions - Holds the available attribute filter options
	// filterSelect - Holds the most recently selected filter's state; initially, set to the filter's default state
	//---------------------------------------
	//					<<[UI Elements]>>
	// legendListItems - Holds selected counties string titles for display in the legend
	// zeroListItems -   Holds counties string titles for counties with a health attribute value that is less than 1 for display in the zero value list
	// dotColorArray - Holds an array of string color values that are linked in parallel with each selected county item
	//---------------------------------------
	//					<<[Save/Load Variables]>>
	// regionSaveLoadSelect - Holds the string LOAD or SAVE based upon user selection. Initial state is empty string
	// fileReader - Holds the data to be written to a file
	// writeFileName - Holds user inputed file name
	//****

	data: {
		countiesDiv: document.getElementById('Counties'),
		chartArea: document.getElementById("ChartArea"),
		legendListItems: [],
		zeroListItems: [],
		dotColorArray: [],
		displayLegend: false,
		displayFilter: false,
		displayZeroList: false,
		displayHealthAttribute: false,
		filterAttributeOptions: ["Raw", "Numerator", "Denominator", "Ratio", "All"],
		filterSelect: 'Raw',
		tempHide: false,
		fullRawData: [],
		dataHolder: null,
		year: 0,
		healthAttribute: null,
		healthAttributeData: [],
		selectedCounties: [],
		previousCounties: [],
		presentCounties: [],
		absentCounties: [],
		marks: [],
		plot: undefined,
		regionSaveLoadSelect: "",
		fileReader: new FileReader(),
		writeFileName: ''
	},
	mounted: function () {
		//will execute at pageload
		this.$el.querySelector(".loader").style.display = 'none';
	},
	methods: {
		/**
		 * Sorts the presentCounties array
		 */
		sortPresentCounties() {
			// Sorting the array based on the first element of each sub-array
			this.presentCounties.sort((a, b) => a[0] - b[0]);
		},
		/** 
		 * Updates the listed counties found within the HTML county list
		 */
		updateCountyList() {
			// Clears the arrays
			this.presentCounties = []
			this.absentCounties = []

			// Checks if the attributes value is not 0. If true, adds that value to the presentCounties array, else adds to the absentCounties.
			let healthAttributeDataList = []
			for (let i = 0; i < this.healthAttributeData.length; i++) {
				healthAttributeDataList.push(this.healthAttributeData[i]) 
				if (this.healthAttributeData[i][1] !== 0) {
					this.presentCounties.push(this.healthAttributeData[i]);
				}
				else {
					this.absentCounties.push(this.healthAttributeData[i]);
				}
			}
			// resets and get the county div
			this.removeAllChildNodes(document.getElementById("Counties"))
			let countiesDiv = document.getElementById("Counties");

			//Checks if zero values are requested and runs the desired logic
			if (this.displayZeroList) {
				let countiesNoZerosResult = this.getCountyList(this.presentCounties);
				this.addDataToUL(this.fullRawData, countiesNoZerosResult, countiesDiv);
				this.plot = this.createPlot([
					Plot.ruleY([0]),
					Plot.ruleX([0]),
					Plot.line(this.presentCounties)
				]);
				// Populates the zero list
				this.createZeroList();
			}
			else {
				let countiesYesZerosResult = this.getCountyList(healthAttributeDataList);
				this.addDataToUL(this.fullRawData, countiesYesZerosResult, countiesDiv);
				this.plot = this.createPlot([
					Plot.ruleY([0]),
					Plot.ruleX([0]),
					Plot.line(this.healthAttributeData)
				]);
			}

			// Loads the previously selected counties/states
			if (this.selectedCounties.length > 0) {
				this.loadPreviosSelection()
			}

			// needed to re-fetch the area to draw the chart - #ChartArea.
			this.chartArea = document.getElementById("ChartArea");

			// Clears the old chart from the display
			this.removeAllChildNodes(this.chartArea);

			// Insert content into the #ChartArea Element.
			this.chartArea.appendChild(this.plot);

			// Saves the selectedCounties for the next iteration
			this.previousCounties = this.selectedCounties;
		},
		/**
		* Returns a list of counies with null/zero values
		*/
		createZeroList() {
			this.zeroListItems = [];
			const columnPositionCounty = 2;
			const columnPositionState = 3;
			const columnPositionCountyFIPS = 4

			//Builds a list of strings that contain the legend information
			for (let i = 0; i < this.absentCounties.length; i++) {
				if (this.absentCounties[i][columnPositionCountyFIPS] === "000") {
					this.zeroListItems.push(this.absentCounties[i][columnPositionCounty]);
				}
				else {
					this.zeroListItems.push(this.absentCounties[i][columnPositionCounty] + ", " + this.absentCounties[i][columnPositionState]);
				}
			}
			return this.zeroListItems;
		},
		/**
		 * Loads the previous selected items to the chart, clicks the previous selected check boxes, and removes counties not found in the present counties.
		 */
		loadPreviosSelection() {
			// Clears previous chart dots and legend
			this.resetCountiesStateList();
			this.clearlegend();

			// Compares this.presentCounties and previousCounties. Populates a new array with matchs found. These matchas will include duplicates due to counties being named the same, and the limitations of the selectedCounties data capture method.
			let countiesFound = []
			if (this.displayZeroList) {
				for (let i = 0; i < this.presentCounties.length; i++) {
					for (let x = 0; x < this.previousCounties.length; x++) {
						if (this.presentCounties[i][2] === this.previousCounties[x].split(",")[0]) {
							countiesFound.push(this.previousCounties[x])
							continue
						}
					}
				}
			}
			else {
				for (let i = 0; i < this.healthAttributeData.length; i++) {
					for (let x = 0; x < this.previousCounties.length; x++) {
						if (this.healthAttributeData[i][2] === this.previousCounties[x].split(",")[0]) {
							countiesFound.push(this.previousCounties[x])
							continue
						}
					}
				}
			}

			// Removes the duplicates
			let uniqueCounties = [...new Set(countiesFound)];

			// Adds the dots
			this.selectedCounties = uniqueCounties;

			// Marks the checkboxes based upon the the items found in uniqueCounties.
			for (let i = 0; i < document.getElementById("Counties").getElementsByTagName('li').length; i++) {
				for (let x = 0; x < uniqueCounties.length; x++) {
					if (document.getElementById("Counties").getElementsByTagName('li')[i].firstChild.id === uniqueCounties[x]) {
						document.getElementById("Counties").getElementsByTagName('li')[i].firstChild.checked = true;
						continue;
					};
				}
			};
		},

		/**
		 * Sorts the health attributes so that alphabetically characters are sorted, and non-alphabetic characters are placed at the end of the list
		 */
		sortHealthAttributes(data) {
			data.columns.sort((a, b) => {
				const nonAlphabeticRegex = /^[^A-Za-z]/; // Regex to check for non-alphabetic characters

				// Check if either string starts with a non-alphabetic character
				const aIsNonAlphabetic = nonAlphabeticRegex.test(a);
				const bIsNonAlphabetic = nonAlphabeticRegex.test(b);

				if (aIsNonAlphabetic && !bIsNonAlphabetic) {
					return 1; // Place 'a' at the end
				} else if (!aIsNonAlphabetic && bIsNonAlphabetic) {
					return -1; // Place 'b' at the end
				} else {
					// If both or neither start with non-alphabetic characters, sort them alphabetically
					return a.localeCompare(b);
				}
			});
			return data
		},
		/**
		* This function clears the selected counties, and legend fields
		*/
		clearButton() {
			this.resetCountiesStateList();
			this.clearlegend();
        },
		/**
		 * Reads the user selected file, draws the chart data
		 * @param {object} event
		 */
		readFile(event) {
			let statusIndex = 0;	// The array index temporarily holding the year or state county status

			// Reads the file.
			this.fileReader.onload = (txtToRead) => {

				// get the content of the txt file that the user selected
				let contents = txtToRead.target.result;

				// Removes utf-8 BOM
				contents = contents.replace(/^\uFEFF/gm, "").replace(/^\u00EF?\u00BB\u00BF/gm, "");

				// split the txt on the commas
				let rows = contents.split("',");

				// Removes unneeded characters from the strings
				for (let i = 0; i < rows.length; i++) {
					rows[i] = rows[i].replace(" '", '');
					rows[i] = rows[i].replace('"', '');
					rows[i] = rows[i].replace("'", '');
				}

				// Confirm that year in selected file’s name matches year in file content.
				if (rows[statusIndex] === this.year) {
					rows.shift();
				} else if (rows[statusIndex] != this.year) {
					console.log('Error: Mismatch Between Selected Year and File\'s Year');
					alert('Error: Mismatch Between Selected Year and File\'s Year');
					return;
				} else {
					console.log('Error: Unknown Year Status')
					alert('Error: Unknown Year Status')
				}

				// Sort the array
				rows.sort();
				this.previousCounties = rows;

				// Compares this.presentCounties and previousCounties. Populates a new array with matchs found. These matchas will include duplicates due to counties be named the same, and the limitations of the selectedCounties data capture method.
				this.loadPreviosSelection();
				document.getElementById("readFile").value = [];
			};
			if (event.target.files[0] === undefined) {
				return;
			}
			this.fileReader.readAsBinaryString(event.target.files[0]);
			// Resets the element so repeated loading attempts will process
			document.getElementById("readFile").value = [];
		},

		/**
		 * Saves the user selected counties/states to a file
		 * @param {any} event
		 */
		writeFile() {

			// Creates and captures user input for the save's file name
			let userResponse = prompt("Please Enter File Save Name:", "ChartSave");
			if (userResponse == null) {
				return
			}
			if (userResponse == "") {
				alert("No Name Entered. File Not Saved")
				return
            }  
			this.writeFileName = userResponse + '.txt'
			
			// Formats and writes the save file
			let text = `\'${this.year}\', `
			for (let i = 0; i < this.selectedCounties.length; i++) {
				text += "'";
				text += this.selectedCounties[i];
				text += "'";
				if (i != this.selectedCounties.length - 1) {
					text += ", "
				};
			};

			// Create temporarily element for file saving
			let element = document.createElement('a');
			element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
			element.setAttribute('download', this.writeFileName);
			element.style.display = 'none';
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);
        },

		/**
		 * Capitalizes the first latter of every word in a sentance
		 * @param {any} str
		 */
		capitalizer(str) {
			if (str === null) {
				return "";
			}
			let words = str.split(" ");
			for (let i = 0; i < words.length; i++) {
				words[i] = words[i][0].toUpperCase() + words[i].substr(1);
			};
			return words.join(" ");
        },

		/**
		 * Searchs the dataset for the County FIPS Code column index and returns that value
		 * @param {any} dataset
		 */
		getCountyFIPSIndex(dataset) {
			let countyFIPS = 0;
			const columnPositionFIPS = 0;

			for (let i = 0; i < this.fullRawData.length; i++) {
				if (Object.keys(dataset[columnPositionFIPS])[i] == "County FIPS Code") {
					countyFIPS = i;
					break;
				};
			};
			return countyFIPS;
		},
		/**
		* This function handles the hiding of the zero list
		*/
		displayZeroListToggle() {
			this.displayZeroList = !this.displayZeroList;
			// Updates the list of counties
			this.updateCountyList();

		},

		/**
		* This function handles the hiding of the health attribute list
		*/
		displayHealthAttributeToggle() {
			this.displayHealthAttribute = true;
		},

		/**
		* This function handles the hiding of the attribute filter items
		*/
		displayFilterToggle() {
			this.displayFilter = true;
		},
		/**
		 *  This function handles the hiding of the legend
		 */
		async displayLegendToggle(dataArray) {
			// Sets the displayLegend element visible
			this.displayLegend = true;
		},
		/**
		* Clears the chart area
		*/
		clearChartArea() {
			this.displayLegend = false;
			this.healthAttribute = null;
		},
		/**
		* Clears the Legend
		*/
		clearlegend() {
			this.legendListItems = [];
		},
		/** 
		* This function clears and resets the county select display list
		*/
		resetCountiesStateList() {
			// Sets the arrays to empty, thus removing the chart dots
			this.selectedCounties = [];

			// Clears all checkboxes in the Counties ul list
			for (let i = 0; i < document.getElementById("Counties").getElementsByTagName('li').length; i++) {
				document.getElementById("Counties").getElementsByTagName('li')[i].firstChild.checked = false;
			};
		},
		/**
		 * @param {any} arrayOfObjects
		* Receives an array of objects, and populates an array with the counties found within
		*/
		createLegendList(arrayOfObjects) {
			this.legendListItems = [];
			const infoIndex = 0;
			const percentileIndex = 0;
			const columnPositionCounty = 1;
			const columnPositionState = 2;
			const columnPositionCountyFIPS = 4
			//Builds a list of strings that contain the legend information
			for (let i = 0; i < arrayOfObjects.length; i++) {
				if (arrayOfObjects[i].info[infoIndex][columnPositionCountyFIPS] === "000") {
					this.legendListItems.push(arrayOfObjects[i].info[infoIndex][columnPositionCounty] + " || " + parseInt(arrayOfObjects[i].percentileInfo[percentileIndex]));
				}
				else {
					this.legendListItems.push(arrayOfObjects[i].info[infoIndex][columnPositionCounty] + ", " + arrayOfObjects[i].info[infoIndex][columnPositionState] + " || " + parseInt(arrayOfObjects[i].percentileInfo[percentileIndex]));
				}
			}
			return this.legendListItems;
		},
		/**
		 * @param {HtmlNode} year
		 * This function fires on year selection, and reads the selected file
		 */
		async setChartAttributes(year) {
			this.year = year.target.value;

			//Get the columns div
			let healthAttrs = document.getElementById("HealthAttrs");
			let countiesDiv = document.getElementById("Counties");
			let healthAttrsFieldIsEmpty = this.checkIfNodeIsEmpty(healthAttrs);
			let countiesFieldIsEmpty = this.checkIfNodeIsEmpty(countiesDiv);

			if (countiesFieldIsEmpty === false) {
				this.removeAllChildNodes(countiesDiv);
			}

			if (healthAttrsFieldIsEmpty === false) {
				this.removeAllChildNodes(healthAttrs);
			}

			// Reads the selected file into the "data" variable
			//TODO: Create a timeout
			await d3.csv(`../uploads/${year.target.value}.csv`)
				.then((data) => {

					// Removes the final column that is empty
					data.columns.pop()

					// Sorts the columns alphabetically
					this.sortHealthAttributes(data)

					// Adds the data value to the global
					this.fullRawData = data;

					// Add to the html list.
					this.addDataToUL(data, data.columns, healthAttrs, "radio"); // data.columns are the health attributes from the csv file.
				})
				.catch((error) => {
					console.error("Getting selected year from the CSV directory failed.");
					console.error(error);
				});

			// Displays the filter dropdown
			this.displayFilterToggle();

			// Displays the health attribute list
			this.displayHealthAttributeToggle();
		},
		/**
		 * @param {Array} dataset
		 * @param {Array} data
		 * @param {string} ulId UL = Unordered list in HTML
		 * @param {string} inputType
		 * Populates the list elements
		 */
		addDataToUL(dataset, data, ulId, inputType = "checkbox") {

			// Loops through and builds the html controls
			for (let i = 0; i < data.length; i++) {

				// Checks the filterSelect global and if it does not equal "All", filters the heath attribute list based upon the passed filter string
				if (this.filterSelect != "All") {
					if (ulId.id === "HealthAttrs") {
						let pos = data[i].search(this.filterSelect.toLowerCase())
						if (pos < 0) {
							continue;
						}
					};
				}

				//Create list item for the input and label to be inserted into
				let liNode = document.createElement("li");

				liNode.classList = ["form-check"];

				//Create input node
				let nodeInput = document.createElement("input");

				nodeInput.type = inputType;
				nodeInput.value = data[i];
				nodeInput.id = data[i];
				nodeInput.classList = ["form-check-input"];
				nodeInput.name = ulId;

				//Label for the checkboxes
				let label = document.createElement('label');
				label.htmlFor = data[i];

				// append the created text to the created label tag
				label.appendChild(document.createTextNode(`${data[i]}`));

				// append the li to the ul div
				ulId.appendChild(liNode);

				// append the checkbox and label to the li's
				liNode.appendChild(nodeInput);
				liNode.appendChild(label);
			}
		},
		/**
		 * @param {Array} data
		 * Returns a list of counties
		 */
		getCountyList(data) {

			//Sorts the array
			data.sort((a, b) => {
				// Place 'US' at the very top
				if (a[3] === 'US') {
					return -1;
				} else if (b[3] === 'US') {
					return 1;
				} else {
					// Place values in array sub 4 that are '000' at the top
					if (a[4] === '000' && b[4] !== '000') {
						return -1;
					} else if (a[4] !== '000' && b[4] === '000') {
						return 1;
					} else {
						// If sub 4 values are not '000', continue with regular sorting
						const stateAbbreviationComparison = a[3].localeCompare(b[3]);
						if (stateAbbreviationComparison !== 0) {
							return stateAbbreviationComparison;
						} else {
							// If state abbreviations are the same, sort by state name
							return a[2].localeCompare(b[2]);
						}
					}
				}
			});

			// Adds the county and state data to a list
			let listOfCounties = [];
			for (var i = 0; i < data.length; i++) {
				if (data[i][4] === "000") {
					var countyWithState = data[i][2];
				} else {
					var countyWithState = data[i][2] + ", " + data[i][3];
				}
				listOfCounties.push(countyWithState);
			}
			return listOfCounties;
		},
		/**
		 * @param {HtmlNode} parent
		 * Removes all child nodes
		 */
		removeAllChildNodes(parent) {
			while (parent.firstChild) {
				parent.removeChild(parent.firstChild);
			}
		},
		/**
		 * @param {HtmlNode} node
		 * Checks if a node is empty
		 */
		checkIfNodeIsEmpty(node) {
			return node.childNodes.length === 0;
		},
		/**
		 * This function handles the health attribute click event logic
		 * @param {Event} clickEvent
		 */
		async readHealthAttribute(clickEvent) {
			if (clickEvent["target"].nodeName === "LABEL") {

				this.healthAttribute = clickEvent["target"].textContent;		// This logic will execute if a user clicks a health attribute label \\

			} else if (clickEvent["target"].nodeName === "INPUT") {

				this.healthAttribute = clickEvent["target"].value;		// This logic will execute if a user clicks a health attribute input \\

			} else {

				console.error("The click event did not have a health attribute. Check the readHealthAttribute method.");
			}
		},
		/**
		 * This function adds and removes items from the selectedCounties global, based upon the results of a clickEvent
		 * @param {Event} clickEvent
		 */
		readCountyCheckbox(clickEvent) {

			// If a box is checked, run this code
			if (clickEvent["target"].checked == true) {
				this.selectedCounties.push(clickEvent["target"].value);
				return;
			}

			// If a box is unchecked, run this code
			let indexOfItemToRemove = this.selectedCounties.indexOf(clickEvent["target"].value);

			// If the index value is greater or equal to 0, splice the item from the array to remove it.
			if (indexOfItemToRemove >= 0) {
				this.selectedCounties.splice(indexOfItemToRemove, 1);
			}
		},
		/**
		 * @param {Array} parsedCountStateArray
		 *  Creates an object that holds identifying and percentile/value information
		 */
		createInfoObjects(parsedCountStateArray) {
			const columnCountyName = 0;
			let countyStateArray = [];

			// for each parsed county state
			for (let a = 0; a < parsedCountStateArray.length; a++) {
				//get the county state index
				let index = this.getCountStateIndex(parsedCountStateArray[a][columnCountyName]);

				// get the county state information
				let info = this.getCountyInformation(parsedCountStateArray[a][columnCountyName]);

				// get the county state percentile information
				let percentileInfo = this.getCountyStateDatapointPercentile(index);

				// create an object with collected information
				let newObject = { info, percentileInfo };

				// push the object to an array
				countyStateArray.push(newObject);
			}
			//return the array of count state object information. 
			return countyStateArray;
		},
		/**
		 * Returns a marks array for the Plot object
		 * @param {Array} arrayOfObjects
		 */
		createPlotMarksArray(arrayOfObjects) {
			let marksArray = [];
			if (this.displayZeroList) {
				this.sortPresentCounties()
				 marksArray = [Plot.ruleY([0]), Plot.ruleX([0]), Plot.line(this.presentCounties)];
			}
			else {
				 marksArray = [Plot.ruleY([0]), Plot.ruleX([0]), Plot.line(this.healthAttributeData)];
			}
			for (let a = 0; a < arrayOfObjects.length; a++) {
				// push plot dots to marks array
				marksArray.push(this.createPlotDots(arrayOfObjects[a]));
				// push plot text to marks array - TODO: See if this can be brought back as hover text
				//marksArray.push(this.createPlotText(arrayOfObjects[a]));
			}
			return marksArray;
		},
		/**
		 * @param {Object} countyStateObject
		 * Plots grapth dots
		 */
		createPlotDots(countyStateObject) {
			// Plot.dot([93.95552771688067, 12212.33], { x: 93.95552771688067, y: 12212.33 })
			return Plot.dot([countyStateObject.percentileInfo[0], countyStateObject.percentileInfo[1]], { x: countyStateObject.percentileInfo[0], y: countyStateObject.percentileInfo[1] });
		},
		/**
		 * @param {Object} countyStateObject
		 * Plots graph Text - TODO: See if this can be brought back as hover text
		 */
		createPlotText(countyStateObject) {
			// Plot text example: Plot.text([93.95552771688067, 12212.33], { x: 93.95552771688067, y: 12212.33, text: ["testing"], dy: -8 })
			return Plot.text([countyStateObject.percentileInfo[0], countyStateObject.percentileInfo[1]], { x: countyStateObject.percentileInfo[0], y: countyStateObject.percentileInfo[1], text: [`${countyStateObject.info[0][1]} ${countyStateObject.info[0][2]} ${countyStateObject.info[0][3]}`], dy: -8 });
		},
		/**
		 * @param {Array} countyStateArray
		 * Returns the county state information
		 */
		//TODO: Rename to reflect that states and counties are returned
		getCountyInformation(countyStateArray) {
			let countyStateInformation = this.dataHolder.filter(
				function findCountState(row) {
					if (countyStateArray.length === 2) {
						if (row[1] === countyStateArray[0] && row[2] === countyStateArray[1]) {
							return row;
						}
					} else if (countyStateArray.length === 1) {
						if (row[1] === countyStateArray[0]) {
							return row;
						}
					} else {
						console.log("There was an error with the county state array's length (Expected lengths are between 1 and 2)")
						return
					}
				}
			);
			return countyStateInformation;
		},
		/**
		 * @param {Array} countyStateArray
		 * Returns the county state index
		 */
		getCountStateIndex(countyStateArray) {

			if (countyStateArray.length === 2) {
				let index = this.dataHolder.findIndex(x => x[1] == countyStateArray[0] && x[2] == countyStateArray[1]);
				return index;
			} else if (countyStateArray.length === 1) {
				let index = this.dataHolder.findIndex(x => x[1] == countyStateArray[0]);
				return index;
			} else {
				console.log("There was an error with the county state array's length (Expected lengths are between 1 and 2)")
				return
			}
		},
		/**
		 * Loops through all the selected counties and split the county and state names into an array: [["Washington County", "TN"], ["Sullivan County", "TN"]];
		*/
		parseSelectedCountyStateArray() {
			let countyStateArray = [];
			for (var i = 0; i < this.selectedCounties.length; i++) {
				let parsed = this.parseCountyAndStateName(this.selectedCounties[i]);
				countyStateArray.push([parsed]);
			}
			return countyStateArray;
		},
		/**
		 * @param {Array} plotMarksArray
		 * Redraws the chart
		 */
		redrawChart(plotMarksArray) {
			this.removeAllChildNodes(this.chartArea);
			this.plot = this.createPlot(plotMarksArray);
			this.chartArea.appendChild(this.plot);
		},
		/**
		 * @param {Number} indexOfCountyState
		 * This function returns the county state percentile information
		 */
		getCountyStateDatapointPercentile(indexOfCountyState) {
			return this.healthAttributeData[indexOfCountyState];
		},
		/**
		 * @param {string} countyState
		 * Splits the counties and states on ","
		 */
		parseCountyAndStateName(countyState) {
			var split = countyState.split(",");
			// Checks if the passed countyState has an abbreviation (A passed countyState will not have an abbreviation if it is a state)
			if (split.length === 2) {
				split[0] = split[0].trim();
				split[1] = split[1].trim();
			} else {
				split[0] = split[0].trim();
			}
			return split;
		},
		/** 
		 * @param {any} plotMarksArray
		 * this function populates the plot's lines and dots
		 */
		createPlot(plotMarksArray = []) {
			if (typeof (plotMarksArray[3]) != "undefined") {
				// Creates an array that holds the X and Y values for the plot marks
				let slicedArray = plotMarksArray.slice(3, plotMarksArray.length);
				let dotArray = [];
				for (let i = 0; i < slicedArray.length; i++) {
					dotArray.push(slicedArray[i].data);
				};

				this.dotColorArray = [];
				// Create a parallel color array for the dotArray
				// TODO: Prepopulate the dotColorArray.
				// replace loop body with this.dotColorArray.push(dotArray[i])
				let count = 0;
				for (let i = 0; i < dotArray.length; i++) {
					if (count === 0) {
						this.dotColorArray.push("red");
					} else if (count === 1) {
						this.dotColorArray.push("green");
					} else if (count === 2) {
						this.dotColorArray.push("blue");
					} else if (count === 3) {
						this.dotColorArray.push("DarkGray")
					} else if (count === 4) {
						this.dotColorArray.push("SaddleBrown");
					} else {
						this.dotColorArray.push("black");
					};

					// Resets the count to zero upon reaching the set limit
					count++
					if (count > 4) {
						count = 0;
					}
				};
				// Returns the plot to the calling function when a county is clicked
				if (this.displayZeroList) {
					this.sortPresentCounties()
					return Plot.plot({
						margin: 60,
						grid: true,
						height: 900,
						width: 1000,
						style: {
							fontSize: "18px",
							marginLeft: "1.5%",
						},
						x: {
							ticks: 10,
							label: "Percentile →",
						},
						y: {
							label: `↑ ${this.capitalizer(this.healthAttribute) + " - " + this.year}`
						},
						marks: [
							Plot.ruleY(this.presentCounties),
							Plot.ruleX(this.presentCounties),
							Plot.line(this.presentCounties, { strokeWidth: 2.5, stroke: "black" }),
							Plot.dot(dotArray, { opacity: 0.8, stroke: "black", r: 10, strokeWidth: 2, fill: this.dotColorArray })
						]
					});
				}
				else {
					return Plot.plot({
						margin: 60,
						grid: true,
						height: 900,
						width: 1000,
						style: {
							fontSize: "18px",
							marginLeft: "1.5%",
						},
						x: {
							ticks: 10,
							label: "Percentile →",
						},
						y: {
							label: `↑ ${this.capitalizer(this.healthAttribute) + " - " + this.year}`
						},
						marks: [
							Plot.ruleY(plotMarksArray[0].data),
							Plot.ruleX(plotMarksArray[1].data),
							Plot.line(plotMarksArray[2].data, { strokeWidth: 2.5, stroke: "black" }),
							Plot.dot(dotArray, { opacity: 0.8, stroke: "black", r: 10, strokeWidth: 2, fill: this.dotColorArray })
						]
					});
				};
			} else {
				// Returns the plot to the calling function when a health attribute is clicked
				if (this.displayZeroList) {
					this.sortPresentCounties()
					return Plot.plot({
						margin: 60,
						grid: true,
						height: 900,
						width: 1000,
						style: {
							fontSize: "18px",
							marginLeft: "1.5%",
						},
						x: {
							ticks: 10,
							label: "Percentile →",
						},
						y: {
							label: `↑ ${this.capitalizer(this.healthAttribute) + " - " + this.year}`
						},
						marks: [
							Plot.ruleY(this.presentCounties),
							Plot.ruleX(this.presentCounties),
							Plot.line(this.presentCounties, { strokeWidth: 2.5, stroke: "black" }),
						]
					});
				}
				else {
					return Plot.plot({
						margin: 60,
						grid: true,
						height: 900,
						width: 1000,
						style: {
							fontSize: "18px",
							marginLeft: "1.5%",
						},
						x: {
							ticks: 10,
							label: "Percentile →",
						},
						y: {
							label: `↑ ${this.capitalizer(this.healthAttribute) + " - " + this.year}`
						},
						marks: [
							Plot.ruleY(plotMarksArray[0]),
							Plot.ruleX(plotMarksArray[1]),
							Plot.line(this.healthAttributeData, { strokeWidth: 2.5, stroke: "black" }),
						]
					});
				}
			}
		}
	},
	compute: {
	},
	watch: {
		/**
		 * This Function watches for changes to the healthAttribute variable, and executes the following code
		 * */
		async healthAttribute() {
			// Checks if the healthAttribute is null and returns an error if true
			if (this.healthAttribute === null) {
				console.error("Health Attribute is null.");
				return;
			}

			// read the health attribute from the csv correct year. 
			this.dataHolder = await d3.csv(`../uploads/${this.year}.csv`)
				.then((data) => {
					return data.map((x) => [Number(x[this.healthAttribute]), x["Name"], x["State Abbreviation"], x["5-digit FIPS Code"], x["County FIPS Code"]]);
				})
				.catch((error) => {
					console.error("Data mapping failed.");
					console.error(error);
				});

			this.dataHolder.sort((a, b) => a[0] - b[0]);

			// element[0] is the health attribute number/data-point. This also serves as an index into a parallel array of the dataHolder property.
			this.healthAttributeData = this.dataHolder.map((element, index) => ([(index / this.dataHolder.length * 100), element[0], element[1], element[2], element[4]]));

			// Updates the list of counties
			this.updateCountyList();

			// Displays the legend
			this.displayLegendToggle();

		},
		/**
		* This function watches for changes to the selectedCounties variable, and executes the following code
		*/
		selectedCounties() {

			// Ensures that previousCounties is always up to date
			this.previousCounties = this.selectedCounties

			let parsedArray = this.parseSelectedCountyStateArray();

			//create object with information to be plotted. 
			let arrayOfObjects = this.createInfoObjects(parsedArray);

			// Populates the legend
			this.createLegendList(arrayOfObjects);

			// create the plot marks: Dots and Text.
			let plotMarksArray = this.createPlotMarksArray(arrayOfObjects);

			// Redraw the chart
			this.redrawChart(plotMarksArray);
		},

		/**
		* This function watches for changes to the filterSelect variable, and executes the following code
		*/
		filterSelect() {
			let healthAttrs = document.getElementById("HealthAttrs");
			this.removeAllChildNodes(healthAttrs);
			this.addDataToUL(this.fullRawData, this.fullRawData.columns, healthAttrs, "radio");
			this.resetCountiesStateList();
			this.clearChartArea();
			this.clearlegend();

		},
		/**
		* This function watches for changes to the year variable, and executes the following code
	    */
		year() {
			this.clearChartArea();
			this.resetCountiesStateList();
			this.clearlegend()
		},

		/** 
		* This function watches for changes to the year variable, and executes the following code
		*/
		regionSaveLoadSelect() {
			if (this.regionSaveLoadSelect != '') {
				if (this.regionSaveLoadSelect === "SAVE") {
					if (this.selectedCounties.length === 0) {
						alert("No Selected Counties/States to Save")
					} else {
						// Calls the writeFile function, so that a user can save chart state
						this.writeFile();
					}
				} else if (this.regionSaveLoadSelect === "LOAD") {
					// Gets the hidden button from the DOM and clicks it
					// This results in the readfile function being called
					const elem = document.getElementById("readFile")
					elem.click();
				} else {
					alert("Invalid Save/Load Option Selected");
                }
            }
			// Resets the variable to its default state of empty string
			this.regionSaveLoadSelect = '';
		}
	}
})