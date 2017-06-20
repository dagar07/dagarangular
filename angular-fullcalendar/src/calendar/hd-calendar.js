(function (window, angular, moment) {
	"use strict";
	var isArray = angular.isArray;
	var forEach = angular.forEach;
	var isString = angular.isString;
	var $ = angular.element;

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
						list : 'List'
					},
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
						}else if(val == _default.agenda.month){
							ctrl.middleHeading = currentMonthDayHeading(val);
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
						templateHead = '<div class="ly-boder text-center ly-pad-tb-4">'+
											'<div class="ly-inline-block" style="width:'+subHeadWidth+
											'" ng-repeat="week in ctrl.monthWeeks" ng-class="$last ? \'\' : \'ly-border-r\'">'+
												'{{week}}'+
											'</div>'+
										'</div>';
						templateHead = templateHead + provideMonthHTML();

					}else if(view == _default.agenda.day){

						templateHead = '<div class="ly-boder ly-pad-tb-4">'+
											'<div class="ly-inline-block ly-border-r" style="width: 6%">&nbsp;</div>'+
											'<div class="text-center ly-inline-block ly-f-16" style="width:93%">{{ctrl.dayHeading}}</div>'+
										'</div>';
						templateHead = templateHead + provideDayHTML();
						
					}else if(view == _default.agenda.week){
						// template Head on rendering year Head.
						templateHead = '<div class="ly-boder text-center ly-pad-tb-4">'+
											'<div class="ly-inline-block ly-border-r" style="width: 6%">&nbsp;</div>'+
											'<div class="ly-inline-block" style="width:13%;"'+
											'" ng-repeat="week in ctrl.weekDaysData" ng-class="$last ? \'\' : \'ly-border-r\'">'+
												'{{week.value}}'+
											'</div>'+
										'</div>';
						templateHead = templateHead + provideWeekDayHTML();

					}
					templateHead = $compile(templateHead)($scope);
					$(document.getElementsByClassName(_default.bodyContainerClass)).html('');
					$(document.getElementsByClassName(_default.bodyContainerClass)).prepend(templateHead);
				}

				function provideMonthHTML(val) {
					var heightOfBox = '70px';//parseInt(100/(_default.weeks.length)) + '%';
					var widthOfBox = parseInt(100/(_default.weeks.length)) + '%';
					var boxHTML = '<div class="week">'+
									'<div class="ly-inline-block ly-boder" ng-repeat="date in ctrl.monthDaysData track by $index" '+
										'ng-class="(ctrl.today == date && ctrl.isCurrMonth) ? \'ly-highlight-today\' : \' \'"  style="height:'+heightOfBox+';width:'+widthOfBox+'">'+
										'<div class="week__day-number date-{{$index}} text-end">'+
											'<span ng-click="ctrl.gotoDaysView(week)">{{date}}</span>'
										'</div>'+
										'<div class="week__day-content"></div>'+
									'</div>'+
								'</div>';
					return boxHTML;
				}

				function getMonthDays(month) {
					month = month ? month : moment().month();
					var dayArr = [];
					var startDayOfCurrMonth = moment().month(month).date(1).weekday();
					var daysInCurrMonth = moment().month(month).daysInMonth();
					var prevMonth = month - 1;
					var noOfDaysInPrevMonth = moment().month(prevMonth).daysInMonth();
					var day = 1;
					for(var i=0; i<_default.numberOfBoxMonth; i++){
						if((startDayOfCurrMonth <= i) && (day <= daysInCurrMonth)){
							dayArr[i] = day;
							if(day++ && (day > daysInCurrMonth)){
								day = i;
							}
						}else if(i < startDayOfCurrMonth){
							dayArr[startDayOfCurrMonth - i - 1] = noOfDaysInPrevMonth--;
						}else {
							dayArr[i] = i - day;
						}
					}

					return dayArr;
				}

				function getMonthIsLeapYear(year) {
					year = year ? year : moment().year();
					return moment([year]).isLeapYear();
				}

				function renderCalander(val) {
					if(ctrl.isActivePeriod == _default.agenda.month){
						// do with month
						_default.viewMonth = _default.viewMonth + (val);
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
						isCureentMonthView();
						ctrl.monthDaysData = getMonthDays(_default.viewMonth);
					}
				}

				// This Section Provide Day rendering for Calander

				function getDayIndex(month, date) {
					return moment().month(month).date(date).weekday();
				}

				function provideDayHTML() {
					var trmplate = '<div class="ly-boder">'+
										'<div class="ly-cal__time" ng-repeat="time in ctrl.dayTimeData track by $index">'+
											'<div class="ly-border-r ly-inline-block" style="width:6%;" ng-class="time.value ?\'ly-border-t\' : \'ly-border-dotted-top\'">'+
												'{{time.value}}'+
											'</div>'+
											'<div ng-class="time.value ?\'ly-border-dotbtm\' : \'ly-border-dotted-top\'" style="width:100%;"></div>'+
										'</div>'+
									'</div>';
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
					date = date ? date : moment().date();
					month = month ? month : moment().month();
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
							display = {
								'value' : weekdaysShort[indexOfDate] + ' ' + getDateDateFormated(month, dateBeforeIndex),
								'month' : month,
								'date' : dateBeforeIndex,
								'year' : year
							};
							weeks[indexOfDate] = display;
						}else if(index == dayIndex){
							display = {
								'value' : weekdaysShort[dayIndex] + ' ' + getDateDateFormated(month, date),
								'month' : dateMonth,
								'date' : date,
								'year' : year
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
							display = {
								'value' : weekdaysShort[indexOfDate] + ' ' + getDateDateFormated(monthAfterIndex, dateAfterIndex),
								'month' : monthAfterIndex,
								'date' : dateAfterIndex,
								'year' : year
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
					var template = '<div class="ly-boder">'+
										'<div class="ly-cal__time" ng-repeat="time in ctrl.dayTimeData track by $index">'+
											'<div class="ly-border-r ly-inline-block" style="width:7%;" ng-class="time.value ?\'ly-border-t\' : \'ly-border-dotted-top\'">'+
												'{{time.value}}'+
											'</div>'+
											'<div ng-class="time.value ?\'ly-border-dotbtm\' : \'ly-border-dotted-top\'">'+
												'<div class="ly-inline-block" style="width:13%;"'+
												'" ng-repeat="week in ctrl.weekDaysData" ng-class="$last ? \'\' : \'ly-border-r\'">'+
												'</div>'+
											'</div>'+
										'</div>'+
									'</div>';
					return template;
				}
			}
		}
	
})(window, window.angular, moment)