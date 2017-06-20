lyTimePicker.$inject = [];

function lyTimePicker() {
	var directive = {
		restrict : 'AE',
		bindToController : true,
		replace : true,
		scope : {
			time : '=?',
			defaultTime : '@?',
			is24Clock : '@?'
		},
		templateUrl : 'directives/time-picker/time-picker.directive.tmpl.html',
		controller : timePickerController,
		controllerAs: 'vm',
	};

	timePickerController.$inject = ['$scope', '$parse'];

	function timePickerController($scope, $parse){
		var vm = this;

		angular.extend(vm, {
			timer : {
				hours : '00',
				minutes : '00',
				ampm : 'am',
				format : 'HH:mm'
			},
			isTimerView : false,
			is24To12Clock : (vm.is24Clock === 'false'),
			changeTimeValue : changeTimeValue,
			timerView : timerViewOnFocus,
			clickOutSide : clickOutSide,
			changeTimeMeridian : changeTimeMeridian
		});

		activate();

		function activate() {
			checkClockType();
			setDefaultTime();
			updateTime();
		}

		function checkClockType() {
			if(vm.is24To12Clock){
				vm.timer.hours = "12";
				vm.timer.format ="hh:mm a";
			}
		}

		function changeTimeValue(type, value){

			var _num = null
			if(vm.is24To12Clock){
				_num = (Number(vm.timer[type]) + value + ((type=='hours')?12:60)) % ((type=='hours')?12:60);
				_num = _num ? _num : ((type=='hours')?12:00);
			}else{
				_num = (Number(vm.timer[type]) + value + ((type=='hours')?24:60)) % ((type=='hours')?24:60);
			}
			vm.timer[type] = leftZero(_num);
			updateTime();
		}

		function leftZero(val) {
			return (parseInt(val) < 10 ? ('0' + val) : val);
		}

		function updateTime() {
			vm.time = vm.timer.hours + ':' + vm.timer.minutes;
			if(vm.is24To12Clock){
				vm.time = vm.time +' '+vm.timer.ampm;
			}
			$scope.time = vm.time;
		}

		$scope.$watch(function () {
			return vm.time;
		}, function () {
			var isValidTime = moment(vm.time, vm.timer.format, true).isValid();
			
			if(!isValidTime){
				var hrsFormat = vm.timer.format.split(':')[0];
				vm.time = moment().format(vm.timer.format);
				vm.timer.hours = moment().format(hrsFormat);
				vm.timer.minutes = moment().format("mm");
				vm.timer.ampm = moment().format("a");
				timerViewOnFocus();
			}
		});

		function setDefaultTime() {

			if(vm.defaultTime && moment(vm.defaultTime, vm.timer.format, true).isValid()){
				var hrsFormat = vm.timer.format.split(':')[0];
				vm.timer.hours = moment(vm.defaultTime, vm.timer.format).format(hrsFormat);
				vm.timer.minutes = moment(vm.defaultTime, vm.timer.format).format('mm');
				vm.timer.ampm = moment(vm.defaultTime, vm.timer.format)._pf.meridiem;
			}
		}

		function timerViewOnFocus(){
			vm.isTimerView = true;
		}

		function  clickOutSide() {
			vm.isTimerView = false;
			updateTime();
		}

		function changeTimeMeridian() {
			vm.timer.ampm = vm.timer.ampm === 'am' ? 'pm' : 'am';
			updateTime();
		}	
	}

	return directive;
}

module.exports = lyTimePicker;