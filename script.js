// MODEL CONTROLLER

var dataController = function(){
	var data = {
		hidden : [],
		guess : [],
		found : [],
		remainingGuesses : 0,
		numOfColors : 6,
		thisGuess : {
			equals : 0,
			missplaced : 0
		}
	};

	// check if guess and hidden are equal. 
	// found array keeps the positions where hidden = guess
	var isEqual = function(){
		data.thisGuess.equals = 0;
		data.hidden.forEach((item, i) => {
			if(item == data.guess[i]){
				data.thisGuess.equals++;
				data.found[i] = true;
			}else{
				data.found[i] = false;
			}
		});
	}

	// check if a guess is missplaced
	var isMissplaced = function(){
		let missed = [];
		for(let k = 0; k < data.found.length; k++){
			missed[k] = false;
		}
		data.found.forEach((correct, i) => {
			if(!correct){
				for(let j = 0; j < data.hidden.length; j++){
					if(!data.found[j]  && !missed[j]){
						if(data.guess[i] == data.hidden[j]){
							data.thisGuess.missplaced ++;
							missed[j] = true;
							break;
						}
					}
				}
			}
		});
	}

	return{
		init : function (){
			const limit = 4;
			data.remainingGuesses = 0;
			data.hidden = [];
			for(let i = 0; i < limit; i++)
				data.hidden.push(Math.floor(Math.random()*data.numOfColors));
		},

		setGuess : function(arr) {	
			data.guess = [];
			data.thisGuess.missplaced = 0;
			data.remainingGuesses++;
			arr.forEach((item) => {
				data.guess.push(item); 
			});
		},

		check : function(){
			isEqual();
			if (data.thisGuess.equals !== data.hidden.length)
				isMissplaced();
		},

		getResults : function(){
			return {
				equals : data.thisGuess.equals,
				isMissplaced : data.thisGuess.missplaced
			};
		},

		getAttempts : function(){
			return data.remainingGuesses;
		},

		reveal : function(){
			return data.hidden;
		},
		/*
		testing : function(){
			console.log(data);
		}
		*/
	}

}();


// UI CONTROLLER

var UIController = function(){
	var UIactive = true;

	// the element for which the user will pick a color
	var setActive = function(el){
			document.querySelector('.active-item').classList.remove('active-item');
			el.classList.add('active-item');
	};

	// checks if user has picked a color for every element
	var guessFull = function(){
		let full = true;
		const guessItems = document.querySelectorAll('.item > .box');
		guessItems.forEach(item => {
			if (item.getAttribute('data-color') == -1)
				full = false;
		});
		return full;
	};

	//	toggle the submit button 
	var enableButton = function(flag){
		if(flag){
			document.querySelector('.submit-guess').removeAttribute('disabled');
		}else{
			const attr = document.createAttribute('disabled');
			document.querySelector('.submit-guess').setAttributeNode(attr);

		}
	};

	//	UX : set the guess with a sequence from thr kog history
	var setColorsFromLog = function(arr){
		const items = document.querySelectorAll('.item > .box');
		items.forEach((item, i) => {
			item.setAttribute('data-color', arr[i]);
		});
	}

	return {
		selectColor : function(){
			if(UIactive){
				//get color index
				const color = this.getAttribute('data-color'); 

				// select active node 
				const active = document.querySelector('.active-item');

				// set color data to item
				const box = active.querySelector('.box');
				box.setAttribute('data-color', color);

				// UX : move active to next item, unless current is the last
				if(box.getAttribute('data-id') != 3)
					setActive(active.nextElementSibling);

				//enable submit button
				if (guessFull()){
					enableButton(true);
				}
			}
		},

		selectItem : function(){
			setActive(this);
		},

		// gets the color data of user's guess
		getColorData : function(){
			let colors = [];
			const guessItems = document.querySelectorAll('.item > .box');
			guessItems.forEach(item => colors.push(item.getAttribute('data-color')));
			return colors;
		},

		// selects a div from the log, from which the color will be reused
		copyColors : function(e){
			if(UIactive){
				if(e.target && e.target.closest('.log-item')){
					node = (e.target.parentElement.parentElement);
					const nodes = node.querySelectorAll('.log-selection .box');
					let colors = [];
					nodes.forEach((item) => {
						colors.push(item.getAttribute('data-color'));
					});
					setColorsFromLog(colors);
					enableButton(true);
				}
			}	
		},

		// clears ui elements, to be ready for the next input
		clearUI : function(){
			//remove colors from guess boxes
			const guessItems = document.querySelectorAll('.item > .box');
			guessItems.forEach(item => {
				item.setAttribute('data-color', '-1');
			});

			//disable submit
			enableButton(false);

			//set first box as active
			document.querySelector('.active-item').classList.remove('active-item');
			document.querySelector('.item').classList.add('active-item');
		},

		// adds a guess to log
		updateLog : function(arr, result, left){
			let html = '<div class="log-item"><h3 class="attempt">'+left+'</h3><div class="log-selection"><div class="box" data-color="'+arr[0]+'" ></div><div class="box" data-color="'+arr[1]+'"></div><div class="box" data-color="'+arr[2]+'"></div><div class="box" data-color="'+arr[3]+'"></div></div><div class="selection-info"><h4>'+result.equals+' correct. '+result.isMissplaced+' missplaced</h4></div></div>' 
			document.querySelector('.log-wrapper').insertAdjacentHTML('afterbegin', html);
		},

		// generates messages
		updateInfo : function(result, remain){
			let str = "";
			if(result.equals == 4){
				// win
				document.querySelector('.remaining-attempts').textContent = 'CONGRATULATIONS!!!';
				str = "You broke the code!!";
			}else if (remain == 10){
				// no more attempts left
				document.querySelector('.remaining-attempts').textContent = 'GAME OVER - YOU LOST';
				str = "Couldn't break the code";
			}else{
				// inform about the result of the guess and the remaining attempts
				document.querySelector('.remaining-attempts').textContent = 'You have '+ (10 - remain) + ' attempts to find the code.';
				if(result.equals == 0 && result.isMissplaced == 0){
					str = 'No matches.';
				}else{
					str = 'Your last guess had ';	
					if(result.equals == 1){
						str += ' 1 item on the exact place';
					}else if(result.equals != 0){
						str += result.equals + ' items on the exact place ';
					}
					if(result.isMissplaced == 1){
						if (result.equals != 0) str += ' and ';
						str += ' 1 item missplaced';
					}else if(result.isMissplaced != 0){
						if (result.equals != 0) str += ' and ';
						str += result.isMissplaced + ' items missplaced '; 
					}
				}
			}	
			document.querySelector('.guess-info').textContent = str;
		},

		// set the colors to the hidden
		revealHidden : function(arr){
			console.log(arr);
			const hidden = document.querySelectorAll('.hidden-selection > .box');
			hidden.forEach((item, i ) =>{
				item.setAttribute('data-color', arr[i]);
			});
		}, 

		// on game over, disable functionality
		disableUI : function(){
			UIactive = false;
			//disable active-class and guess button
			document.querySelector('.active-item').classList.remove('active-item');
			enableButton(false);
		},

		// prepare UI for new game
		resetUI : function(){
			// clear log
			document.querySelector('.log-wrapper').innerHTML = '';

			// clear info
			document.querySelector('.guess-info').textContent = '';
			document.querySelector('.remaining-attempts').textContent = 'You have 10 attempts to find the code.';

			// reset hidden
			const hidden = document.querySelectorAll('.hidden-selection > .box');
			hidden.forEach((item, i ) =>{
				item.setAttribute('data-color', '8');
			});

			// reset boxes
			const box = document.querySelectorAll('.item > .box');
			box.forEach((item, i ) =>{
				item.setAttribute('data-color', '-1');
			});

			// set active-item
			document.querySelector('.item').classList.add('active-item');

			UIactive = true;
		}
	}

}();


// APP controller 

var AppController = function(dataCtr, UICtr){

	var setUpEventListeneres = function(){
		document.querySelector('.start-game').addEventListener('click', restart);

		let colors = document.querySelectorAll('.select-color');
		for (const color of colors){
			color.addEventListener('click', UICtr.selectColor);
		}

		let items = document.querySelectorAll('.item');
		for(const item of items){
			item.addEventListener('click', UICtr.selectItem);
		}

		document.querySelector('.submit-guess').addEventListener('click', submitGuess);

		document.querySelector('.log').addEventListener('click', UICtr.copyColors);
	};

	var submitGuess = function(){
		let colors = [];

		// get color data from UI
		colors = UICtr.getColorData();

		// update model
		dataCtr.setGuess(colors);

		//check
		dataCtr.check();

		//get results
		let results = dataCtr.getResults();

		//update info
		let remain = dataCtr.getAttempts();
		UICtr.updateInfo(results, remain);

		//update log
		UICtr.updateLog(colors, results, remain);

		if (remain == 10 || results.equals == 4){
			// GAME OVER
			// show hidden
			UICtr.revealHidden(dataCtr.reveal());
			//disable UI
			UICtr.disableUI();
		}else{
			// update ui
			UICtr.clearUI();
		}
	}


	var	restart =  function(){
		console.log('restart game');
		dataCtr.init();
		UICtr.resetUI();
	}

	return {
		setup : function(){
			dataCtr.init();
			setUpEventListeneres();
		}
	};

}(dataController, UIController);

AppController.setup();