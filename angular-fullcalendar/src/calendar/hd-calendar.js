(function (window, angular, moment) {
	"use strict";
	var isArray = angular.isArray;
	var forEach = angular.forEach;
	var isString = angular.isString;
	var $ = angular.element; // use for JqLit;

	angular.module("lyCalendar", ["ng"]);
	angular.module("lyCalendar")
		.directive('lyFullCalander', lyFullCalander);
		lyFullCalander.$inject = ["$parse"];
		function lyFullCalander($parse) {
		 	return {
		 		template : '<div class="ly-cal">'+
		 						'<div class="text-center">'+
			 						'<div class="f-left ly-inline-block left-btn-section"></div>'+
			 						'<div class="ly-inline-block"><h2>{{ctrl.middleHeading}}</h2></div>'+
			 						'<div class="f-right ly-inline-block right-btn-section"></div>'+
			 					'</div>'+
		 						'<div class="ly-cal__body cal-body-container"></div>'+
		 					'</div>',
			 	retrict : 'E',
			 	require : ["?ngModel"],
			 	controller : lyFullCalanderController,
			 	controllerAs : 'ctrl',
			 	bindToController : true,
			 	scope : {
			 		option : "=?"
			 	}
			}
			lyFullCalanderController.$inject = ["$rootScope", "$scope", "$attrs", "$element", "$interpolate", "$compile", "$parse"]
			function lyFullCalanderController($rootScope, $scope, $attrs, $element, $interpolate, $compile, $parse){
				var ctrl = this;
				var _default = {
					weeks : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
					bodyContainerClass : 'cal-body-container',
					months : moment.months(),
					weekdays :moment.weekdays(),
					numberOfBoxMonth  : 7*6,
					viewMonth : moment().month(),
					viewDate : moment().date(),
					viewYear : moment().year(),
					today : moment().date(),
					startTime : 8,
					endTime : '00',
					minsSlot : 30,
					dateInfoObject : null,
					randomYear : null,
					daysDateFormat : 'D/M',
					header : {
						left : 'prev,next',
						middle : currentMonthDayHeading(),
						right : 'day,month,year,list'
					},
					agenda : {
						month : 'Month',
						day : 'Day',
						week : 'Week',
						//list : 'List'
					},
					eventAdd : [],
				};

				angular.extend(ctrl, {
					middleHeading : _default.header.middle, 
					isActivePeriod : 'Month', // value of this Month, Day, Week and List.
					init : init,
					isCurrMonth : true,
					monthWeeks : _default.weeks,
					monthDaysData : getMonthDays(),
					isLeapyear : getMonthIsLeapYear(),
					today : _default.today,
					dayHeading : getDayOfDate(_default.viewMonth, _default.viewDate),
					dayTimeData : getDayTimeData(),
					gotoDaysView : updateViewOnDay,
					addEvent : addUserEvent,
					eventEdit : editEvent,
					viewDayDateIsCurr : false,
					leftbtnAction : function (dir) {
						
						if(dir == 'next'){
							renderCalander(1)
						}else if(dir == 'prev'){
							renderCalander(-1)
						}
					},
					rightBtnAction : function (val) {
						ctrl.isActivePeriod = val;

						if(val == _default.agenda.day){
							ctrl.dayTimeData = getDayTimeData();
							ctrl.dayHeading = getDayOfDate(_default.viewMonth, _default.viewDate);
							ctrl.middleHeading = currentMonthDayHeading(val);
							isCurrentMonthDate();
						}else if(val == _default.agenda.month){
							ctrl.middleHeading = currentMonthDayHeading(val);
							ctrl.monthDaysData = getMonthDays(_default.viewMonth);
						}else if(val == _default.agenda.week){
							ctrl.weekDaysData = getWeekDayHeadData();
						}
						renderDateSkeletonTable(val);
					}
				});
				init();
				function init() {
					var extOption = $attrs.option ? $parse($attrs.option) : null;
					if(extOption){
						forEach(extOption(), function (val, key) {
							_default[key] = val;
						});
					}
					provideEventData();
					renderHeadLeftSection();
					renderHeadRightSection();
					renderDateSkeletonTable('Month');

				}

				function currentMonthDayHeading(agenda){
					if(!agenda){
						return moment().month(moment().month()).format('MMMM,  YYYY');
					}
					if(agenda == _default.agenda.day){
						_default.dateInfoObject = checkDateStatusInDayView();
						return moment().month(_default.viewMonth).date(_default.viewDate).format('dddd, MMMM D, YYYY');
					}else if(agenda == _default.agenda.month){
						return moment().month(_default.viewMonth).format('MMMM,  YYYY');
					}else if(agenda == _default.agenda.week){
						return null;
					}
				}

				function renderHeadLeftSection() {
					var leftBtns = _default.header.left.split(',');
					var btnTempHTML = null;
					forEach(leftBtns, function (val, key) {
						btnTempHTML = '<button ng-click="ctrl.leftbtnAction(\''+val+'\')"><span class="btn-icon-mid '+val+'-icon"></span></button>';
						insertBtnInDom(btnTempHTML, 'left-btn-section');
					});
				}

				function  renderHeadRightSection(){
					var rightBtns = _default.agenda;
					var btnTempHTML = null;
					forEach(rightBtns, function (val, key) {
						btnTempHTML = 	'<button ng-class="ctrl.isActivePeriod == \''+val+'\' ? \'btn-active\' : \' \'" ng-click="ctrl.rightBtnAction(\''+val+'\')">'+
											'<span class="btn-icon-mid '+val+'-icon">'+val+'</span>'+
										'</button>';
						insertBtnInDom(btnTempHTML, 'right-btn-section');
					});
				}

				function insertBtnInDom(template, pos) {
					template = $compile(template)($scope);
					$(document.getElementsByClassName(pos)).append(template);
				}

				function renderDateSkeletonTable(view){
					var templateHead = null;
					if(view == _default.agenda.month){
						var subHeadWidth = parseInt(100/(_default.weeks.length)) + '%';
						templateHead = '<thead class="ly-boder">'+
											'<tr>'+
												'"<th ng-repeat="week in ctrl.monthWeeks" ng-class="$last ? \'\' : \'ly-border-r\'">'+
													'<span>{{week}}</span>'+
												'</th>'+
											'</tr>'+
										'</thead>';
						isCureentMonthView();
						templateHead = templateHead + provideMonthHTML();

					}else if(view == _default.agenda.day){

						templateHead = '<thead class="ly-boder ly-pad-tb-4">'+
											'<tr>'+
												'<th class="ly-border-r" style="width: 6%">&nbsp;</th>'+
												'<th class="text-center ly-f-16" style="width:93%">{{ctrl.dayHeading}}</th>'+
											'</tr>'
										'</thead>';
						templateHead = templateHead + provideDayHTML();
						
					}else if(view == _default.agenda.week){
						// template Head on rendering year Head.
						templateHead = '<thead class="ly-boder text-center ly-pad-tb-4">'+
											'<tr>'+
												'<th class="ly-border-r" style="width: 6%">&nbsp;</th>'+
												'<th style="width:13%;" ng-repeat="week in ctrl.weekDaysData" ng-class="$last ? \'\' : \'ly-border-r\'">'+
												'{{week.value}}'+
												'</th>'+
											'</tr>'
										'</thead>';
						templateHead = templateHead + provideWeekDayHTML();

					}
					templateHead = '<table class="ly-table">'+ templateHead + '</table>'
					templateHead = $compile(templateHead)($scope);
					$(document.getElementsByClassName(_default.bodyContainerClass)).html('');
					$(document.getElementsByClassName(_default.bodyContainerClass)).prepend(templateHead);
				}

				function provideMonthHTML(val) {
					var heightOfBox = '70px';//parseInt(100/(_default.weeks.length)) + '%';
					var widthOfBox = parseInt(100/(_default.weeks.length)) + '%';
					var boxHTML = '<tbody class="week">'+
									'<tr class="ly-cursor-ponter ly-boder" ng-repeat="dateSlots in ctrl.monthDaysData track by $index">'+
										'<td class="ly-table__td" ng-repeat="date in dateSlots track by $index"  ng-click="ctrl.addEvent(date.date, date.month, $event)" '+
										'ng-class="(ctrl.today == date.date && ctrl.isCurrMonth) ? \'ly-highlight-today\' : \' \'"  style="height:'+heightOfBox+';">'+
										'<div class="week__day-number date-{{$index}} text-end">'+
											'<span class="ly-hover-underline" ng-class="date.isViewMonthDate ? \'\': \'ly-color-light-grey\'" ng-click="ctrl.gotoDaysView(date.date, date.month)">{{date.date}}</span>'+
										'</div>'+
										'<div ng-click="ctrl.eventEdit(event, $event)" class="week__day-content ly-text-captilize" ng-repeat="event in date.event" ng-class="event.value ? \'ly-event-bg-color ly-event\' : \'\'"><span>{{event.value}}</span></div>'+
										'</td>'+
									'</tr>'+
								'</tbody>';
					return boxHTML;
				}

				function getMonthDays(month) {
					month = month ? month : moment().month();
					var dayArr = [];
					var firstDateDayInMonth = moment().month(month).date(1).weekday();
					var daysInCurrMonth = moment().month(month).daysInMonth();
					var prevMonth = isValidMonth(month - 1) ? (month - 1) : getValidMonthNumber(month - 1); // check valid month , if not return valid month;
					var nextMonth = isValidMonth(month + 1) ? (month + 1) : getValidMonthNumber(month + 1)  // check valid month , if not return valid month;
					var noOfDaysInPrevMonth = moment().month(prevMonth).daysInMonth();
					var day = 1;
					var monthDaysFormat = [];
					monthDaysFormat[0] = [];
					var dateObj = {
						date : null,
						isViewMonthDate : true,
					};
					var i = 0;
					for(var index = 0; index<6; index++){
						monthDaysFormat[index] = [];
						for(var m=0; m<7; m++){
							if((firstDateDayInMonth <= i) && (day <= daysInCurrMonth)){
								dateObj = {
									date : 	day,
									isViewMonthDate : true,
									event : _default.eventAdd[day],
									month : month
								};
								dayArr[i] = dateObj;
								monthDaysFormat[index][m] = dateObj;
								if(day++ && (day > daysInCurrMonth)){
									day = i;
								}
							}else if(i < firstDateDayInMonth){
								var datePrev = noOfDaysInPrevMonth--
								dateObj = {
									date : datePrev,
									isViewMonthDate : false,
									event : _default.eventAdd[datePrev],
									month : prevMonth,
								};
								monthDaysFormat[index][firstDateDayInMonth - i - 1] = dateObj;
								dayArr[firstDateDayInMonth - i - 1] = dateObj;
							}else {
								dateObj = {
									date : 	(i - day),
									isViewMonthDate : false,
									event : _default.eventAdd[(i - day)],
									month : nextMonth,
								};
								dayArr[i] = dateObj;
								monthDaysFormat[index][m] = dateObj;
							}
							i++;
						}
					}
					return monthDaysFormat; // 2D arrey to render data for Month dates;
				}

				function getMonthIsLeapYear(year) {
					year = year ? year : moment().year();
					return moment([year]).isLeapYear();
				}

				function getValidMonthNumber(month){
					if(month > 11){
						return (month - 11);
					}else if(month < 0){
						return (month + 1);
					}
				}

				function renderCalander(val) {
					if(ctrl.isActivePeriod == _default.agenda.month){
						// do with month
						_default.viewMonth = _default.viewMonth + (val);
						_default.viewDate = 1;
						isCureentMonthView();
						ctrl.middleHeading = currentMonthDayHeading(ctrl.isActivePeriod, _default.viewMonth) ;
						ctrl.monthDaysData = getMonthDays(_default.viewMonth);

					}else if(ctrl.isActivePeriod == _default.agenda.week){
						// do with weeks
						var updateNextWeek = null;
						if(val > 0){
							updateNextWeek = ctrl.weekDaysData[6];
						}else{
							updateNextWeek = ctrl.weekDaysData[0];
						}
						var date = updateNextWeek.date + (val);
						var month = updateNextWeek.month;
						var nextWeekDate = moment().month(month).date(date).toObject();
						ctrl.weekDaysData = getWeekDayHeadData(nextWeekDate.months, nextWeekDate.date);

					} else if(ctrl.isActivePeriod == _default.agenda.day){
						// do with days
						_default.viewDate = _default.viewDate + (val);
						ctrl.dayHeading = getDayOfDate(_default.viewMonth, _default.viewDate);
						ctrl.middleHeading = currentMonthDayHeading(ctrl.isActivePeriod);
						_default.viewMonth = _default.dateInfoObject.months;
						ctrl.monthDaysData = getMonthDays(_default.viewMonth);
						isCurrentMonthDate();
					}
				}

				function isCurrentMonthDate(date, month) {
					if(isCureentMonthView() && (ctrl.today == _default.viewDate)){
						ctrl.viewDayDateIsCurr = true;
					}else{
						ctrl.viewDayDateIsCurr = false;
					};
				}

				// This Section Provide Day rendering for Calander

				function getDayIndex(month, date) {
					return moment().month(month).date(date).weekday();
				}

				function provideDayHTML() {
					var trmplate = '<tbody class="ly-boder">'+
										'<tr class="ly-cal__time" ng-repeat="time in ctrl.dayTimeData track by $index" ng-class="time.value ?\'ly-border-t\' : \'ly-border-dotted-top\'">'+
											'<td class="ly-border-r">'+
												'{{time.value ? time.value : "&nbsp;"}}'+
											'</td>'+
											'<td ng-click="ctrl.addEvent(null, null, $event)" class="ly-table__day-td " ng-class="ctrl.viewDayDateIsCurr ? \'ly-highlight-today\' : \' \'" >'+
												// '<div class="ly-inline-block ly-table__day-td--event" style="width:90%;"></div>'+
											'</td>'+
										'</tr>'+
									'</tbody>';
					return trmplate;
				}

				function getDayTimeData(startHrs, endHrs, minDiff, date, month) {
					var dayTime = [];
					minDiff = minDiff ? minDiff : _default.minsSlot; // default value
					startHrs = startHrs ? startHrs : _default.startTime;
					endHrs = endHrs ? setEndHrs(endHrs) : setEndHrs(_default.endTime);
					var minsSlots = 0;
					for(startHrs; startHrs <= endHrs; ){
						var timeValue = convert24to12hrs(startHrs)+''+ isAmPmhrs(startHrs);
						dayTime.push({value : timeValue});
						minsSlots = minsSlots + minDiff;
						while(minsSlots < 60){
							minsSlots = minsSlots + minDiff;
							dayTime.push({value : ''});
						}
						minsSlots = 0;
						startHrs = startHrs + 1;
					}
					return dayTime;
				}

				function updateViewOnDay(date, month) {
					console.log(date);
					_default.viewDate = date;
					_default.viewMonth = month;
					ctrl.rightBtnAction("Day")
				}

				function setEndHrs(hrs){
					if(hrs.toString() == '00'){
						return 24;
					}else{
						hrs = parseInt(hrs);
						return hrs;
					}
				}

				function timeleftZero(val) {
					return val < 10 ? ('0'+val) : val;
				}

				function isAmPmhrs(hr){
					// Do stuff to check am and pm;	
					return (hr >= 12 ? 'pm' : 'am');
				}

				function is24Hrs(hr) {
					// check 24 hrs;
					return (hr > 12 ? true : false);
				}

				function convert24to12hrs(hr) {
					return (hr > 12 ? (hr - 12) : hr); 
				}

				function getDayOfDate(month, date) {
					// if date is 0 and month is non-zero , its show prev month last date;
					var indexOfDay = moment().month(month).date(date).weekday(); 
					return _default.weekdays[indexOfDay];
				}

				function isCureentMonthView() {

					if(_default.viewMonth == moment().month()){
						ctrl.isCurrMonth = true;
					}else {
						ctrl.isCurrMonth = false;
					}

					return ctrl.isCurrMonth;
				}

				function checkDateStatusInDayView(){
					// return object of view date;
					// contains date , month , year, hours and monutes;
					return moment().month(_default.viewMonth).date(_default.viewDate).toObject(); 
				}

				// this section provide week days selection 

				function getWeekDayHeadData(month, date) {
					var weeks = [];
					var display = null;
					date = date ? date : _default.viewDate;
					month = month ? month : _default.viewMonth;
					var dayIndex = getDayIndex(month, date);
					var dateMonth = month;
					var year = _default.viewYear;
					var weekdaysShort = moment.weekdaysShort();
					var dateBeforeIndex = null;
					var dateAfterIndex = null;
					var monthAfterIndex = month;
					var monthBeforeIndex = month;
					var noOfDaysInMonth = moment().month(month).daysInMonth();
					for(var index=0; index<7; index++){
						var isCurrMonthDate = false;
						if(index < dayIndex){
							
							if((date - index - 1) >= 0){
								dateBeforeIndex = date - index - 1;
							}else{
								dateBeforeIndex = dateBeforeIndex - 1;
							}
							if(!isValidDate(month, dateBeforeIndex)){
								month = month - 1;
								dateBeforeIndex = moment().month(month).daysInMonth();
							}
							var indexOfDate = getDayIndex(month, dateBeforeIndex);
							if(isCureentMonthView() && (ctrl.today == dateBeforeIndex)){
								isCurrMonthDate = true;
							}
							display = {
								'value' : weekdaysShort[indexOfDate] + ' ' + getDateDateFormated(month, dateBeforeIndex),
								'month' : month,
								'date' : dateBeforeIndex,
								'year' : year,
								'isCurrMonthDate' : isCurrMonthDate
							};
							weeks[indexOfDate] = display;
						}else if(index == dayIndex){
							if(isCureentMonthView() && (ctrl.today == date)){
								isCurrMonthDate = true;
							}
							display = {
								'value' : weekdaysShort[dayIndex] + ' ' + getDateDateFormated(month, date),
								'month' : dateMonth,
								'date' : date,
								'year' : year,
								'isCurrMonthDate' : isCurrMonthDate
							};
							weeks[dayIndex] = display;
						}else{

							
							if(date + (index - dayIndex) > noOfDaysInMonth){
								dateAfterIndex = dateAfterIndex + 1;
							}else{
								dateAfterIndex = date + (index - dayIndex);
							}
							if(!isValidDate(monthAfterIndex, dateAfterIndex)){
								monthAfterIndex = month + 1;
								dateAfterIndex = 1;
							}
							var indexOfDate = getDayIndex(monthAfterIndex, dateAfterIndex);
							if(isCureentMonthView() && (ctrl.today == dateAfterIndex)){
								isCurrMonthDate = true;
							}
							display = {
								'value' : weekdaysShort[indexOfDate] + ' ' + getDateDateFormated(monthAfterIndex, dateAfterIndex),
								'month' : monthAfterIndex,
								'date' : dateAfterIndex,
								'year' : year,
								'isCurrMonthDate' : isCurrMonthDate
							};
							weeks[indexOfDate] = display;
						}
					}
					getMiddleHeadingForWeekView(weeks);
					return weeks;
				}

				function getMiddleHeadingForWeekView(weeks) {
					var shortMonth = moment.monthsShort();
					var startDate = null;
					var endDate = null;
					_default.viewMonth = weeks[0].month;
					_default.viewDate = weeks[0].date;
					startDate = shortMonth[weeks[0].month]+' '+ weeks[0].date;
					if(weeks[0].month != weeks[6].month){
						endDate = shortMonth[weeks[6].month]+' '+weeks[6].date;
					}else{
						endDate = weeks[6].date;
					}

					if(weeks[0].year != weeks[6].year){
						startDate = startDate + ', '+weeks[0].year;
						endDate = endDate + ', '+weeks[0].year;
					}else{
						endDate = endDate + ', ' + weeks[0].year;
					}

					ctrl.middleHeading = startDate +' - '+ endDate ;
				}

				function getDateDateFormated(month, date) {
					return  moment().month(month).date(date).format(_default.daysDateFormat);
				}

				function isValidDate(month, date) {
					var noOfDaysInMonth = moment().month(month).daysInMonth();
					return (date <= noOfDaysInMonth && date > 0)? true :false;
				}

				function isValidMonth(month){
					return (month > -1 && month < 12) ? true : false;
				}

				function getYearOfDate(month, date) {
					return;
				}
				// function isValidYear(year) { want to check is valid month or not need to fix;
				// 	return (year > -1 && year < 12) ? true : false;
				// }

				function provideWeekDayHTML() {
					var template = '<tbody class="ly-boder">'+
										'<tr class="ly-cal__time" ng-repeat="time in ctrl.dayTimeData track by $index" ng-class="time.value ?\'ly-border-t\' : \'ly-border-dotted-top\'">'+
											'<td class="ly-border-r" style="width:7%;">'+
												'{{time.value ? time.value : "&nbsp;"}}'+
											'</td>'+
											'<td ng-repeat="week in ctrl.weekDaysData" ng-click="ctrl.addEvent(week.date, week.month, $event)"'+
												' ng-class="{\'ly-highlight-today\': week.isCurrMonthDate, \'ly-border-r\' : !$last}">'+
												'<div style="width:13%;">'+
												'</div>'+
											'</td>'+
										'</tr>'+
									'</tbody>';
					return template;
				}


				// This section add Event in view
				function addUserEvent(date, month, $event) {
					var message = "Please enter event title";
					var result = window.prompt(message, "e.g meeting..");
					if(!result){
						return;
					}
					var currTarget = $event.currentTarget;
					var template = $compile('<div ng-click="ctrl.eventEdit(event, $event)" class="week__day-content ly-text-captilize ly-event-bg-color ly-event ly-text-ellipsis"><span>'+result+'</span></div>')($scope);
					$(currTarget).append(template);
					if(!_default.eventAdd[date]){
						_default.eventAdd[date] = [];
					}
					_default.eventAdd[date].push({
						date : date,
						value : result,
					});
				}

				function provideEventData() {
					_default.eventAdd[20] = [{
						date : 20,
						value : "good day",
					}];
				}

				function editEvent(event, e) {
					e.stopPropagation();
					console.log(event);
				}
			}
		}
	
})(window, window.angular, moment)