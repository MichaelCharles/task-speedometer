/* global $ */

// Clock object is self contained, and has everything
// necessary to make all the calculations for the project.
// All the GUI stuff is handled in other functions/the
// main document.ready function.
var clock = {
  resetRequested: false, // used to evaluate whether the reset button was pressed.
  isStopped: true, // if isStopped is false, time will be acounted as "timeSpentWorking"
  isResting: false, // if isResting is true AND isStopped is false, time is counte das "timeNotWorking"
  // Internal timer for clock calculations, runs independant of the timer used to update the interface.
  internalTimer: setInterval(function() { 
    if (!clock.isStopped && !clock.isResting) {
      clock.timeSpentWorking = clock.timeSpentWorking + 500;
    } else if (!clock.isStopped && clock.isResting) {
      clock.timeNotWorking = clock.timeNotWorking + 500;
    }
    
    
        // Calculate Estimates
    var lengthSums = clock.taskLengths.reduce(function(a, b) {
      return a + b
    });
    clock.averageTaskLength = lengthSums / clock.taskLengths.length;
    clock.estimatedTimeRemaining = clock.averageTaskLength * clock.tasksLeft;
    var currentTime = new Date().getTime();
    clock.estimatedCompletionTime = clock.estimatedTimeRemaining + currentTime;

  }, 500),
  taskStartTime: 0,
  taskEndTime: 0,
  breakStartTime: 0,
  breakEndTime: 0,
  taskBreakLength: 0,
  taskLengths: [],
  tasksLeft: 0,
  averageTaskLength: 0,
  timeSpentWorking: 0,
  timeNotWorking: 0,
  estimatedCompletionTime: 0,
  estimatedTimeRemaining: 0,
  startTask: function() {
    clock.isStopped = false;
    clock.taskBreakTime = 0;
    clock.taskStartTime = new Date().getTime();
  },
  finishTask: function() {
    clock.tasksLeft--;
    clock.taskEndTime = new Date().getTime();
    clock.taskLengths.push(clock.taskEndTime - clock.taskStartTime - clock.taskBreakLength);


    // Update variables for next task
    clock.taskBreakLength = 0;
    clock.taskStartTime = clock.taskEndTime;
  },
  takeBreak: function() {
    clock.isResting = true;
    clock.breakStartTime = new Date().getTime();
  },
  resumeTask: function() {
    clock.isResting = false;
    clock.breakEndTime = new Date().getTime();
    var breakTime = clock.breakEndTime - clock.breakStartTime;
    clock.taskBreakLength = clock.taskBreakLength + breakTime;
  },
  reset: function() {
    // Incomplete (obviously) this function should
    // Reset the app to its initial state.
  }
}

function msToTime(duration) {
// http://stackoverflow.com/questions/9763441/milliseconds-to-time-in-javascript
// Took this function from Stack Overflow. Consider updating it later to display
// "0 hours, 1 minute, and 25 seconds" or something along those lines.
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
}

function updateInterface() {
  // This function puts all the information from the clock object onto the page
  // for the user to read.
  $(".current-time").html(new Date());
  if (clock.estimatedCompletionTime !== 0) {
    $(".estimated-completion-time").html(new Date(clock.estimatedCompletionTime));
  }
  $(".average-task-length").html(msToTime(clock.averageTaskLength));
  $(".time-spent-working").html(msToTime(clock.timeSpentWorking));
  $(".time-not-working").html(msToTime(clock.timeNotWorking));
  if (!$(".tasks-count").is(':focus') && $(".tasks-count").val() > 0) {
    $(".tasks-count").val(clock.tasksLeft);
  }
  if (clock.resetRequested) {
    // perform addition UI updates to reset things
    // to their initial state.
  }
}

$(document).ready(function() {
  // Hide everything but the start button.
  $(".finish").hide();
  $(".break").hide();
  $(".resume").hide();
  $(".reset").hide();
  
  // Run updateInterface() as soon as the page loads
  // (later it will be run in mainTimer)
  updateInterface();

  // If number of tasks are specified, enable buttons.
  $(".tasks-count").on("input", function() {
    if (parseInt($(".tasks-count").val()) > 0) {
      $("button").prop("disabled", false);
      $("p.tip").fadeOut("slow");
      clock.tasksLeft = $(".tasks-count").val();
    } else {
      $("button").prop("disabled", true);
      $("p.tip").fadeIn("slow");
    }
  });

  // mainTimer updates the interface every half second.
  var mainTimer = setInterval(function() {
    updateInterface();
  }, 500);

  $(".start").click(function() {
    clock.startTask();
    $(".finish").show();
    $(".break").show();
    $(".start").hide();
    // When reset() method is added to clock, uncomment the following
    // to show the reset button.
    // $(".reset").show();
  });
  $(".resume").click(function() {
    clock.resumeTask();
    $(".break").show();
    $(".resume").hide();
    $(".finish").show();
  });
  $(".finish").click(function() {
    clock.finishTask();
  });
  $(".break").click(function() {
    clock.takeBreak();
    $(".resume").show();
    $(".break").hide();
    $(".finish").hide();
  });
  $(".reset").click(function() {
    clock.reset();
  });

  function parseTaskLengths(arr) {
    // parse task length data to make it more human readable,
    // and also to give it spaces so that the array wraps
    // when displayed in the dev area.
    let data = [];
    arr.forEach(function(i) {
      data.unshift(msToTime(i));
    })
    return data.join(", ");
  }

  var devTimer = setInterval(function() {
    // I wanted to see the variables updating live while working on
    // this project. However, the information is interseting, so
    // I'm thinking of just leaving the dev area visible at least
    // in this app's current form. If I eventually update to a
    // different UI, I'll probably present the information differently.
    var spacer = " &nbsp;&nbsp;";
    $(".dev").html("taskStartTime: " + clock.taskStartTime +
      spacer + "taskEndTime: " + clock.taskEndTime +
      spacer + "breakStartTime: " + clock.breakStartTime +
      spacer + "breakEndTime: " + clock.breakEndTime +
      spacer + "breakBreakLength: " + clock.taskBreakLength +
      spacer + "averageTaskLength: " + clock.averageTaskLength +
      spacer + "timeSpentWorking: " + clock.timeSpentWorking +
      spacer + "timeNotWorking: " + clock.timeNotWorking +
      spacer + "estimatedCompletionTime: " + clock.estimatedCompletionTime +
      spacer + "estimatedTimeRemaining: " + clock.estimatedTimeRemaining +
      spacer + "tasksLeft: " + clock.tasksLeft +
      spacer + "taskLengths: " + parseTaskLengths(clock.taskLengths));
  }, 500);
});