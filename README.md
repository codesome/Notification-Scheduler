# Notification Scheduler

```
$ git clone https://github.com/thecodesome/Notification-Scheduler.git
$ cd Notification-Scheduler/
```

### Start notification scheduler
```
$ npm start
```

### Testing the scheduler

First start the test server. Run the below command in same directory.

```
$ npm test
```

Open `http://localhost:3000/addUsers/100` in browser to add 100 dummy users in the database. You can replace 100 with any valid positive integer.

Open `http://localhost:3001`. Here you can see the list of all users. You can select here either to send or schedule notification for every user. You can see the termial of the server where scheduler has started to know about about the status of receival of the notification from here.

Once the scheduler sends the notifications, you can see in the termial of the testing server about the receival of notification.

Open `http://localhost:3001/notify` to check all the notification received from the scheduler. Clicking on any of the notification will act like clicking on the notification itself and this action will be tracked by scheduler.

# Scheduling Technique

### Time index
Each hour is divided into 6 parts of 10 minutes each. Hence a day of 24 hours has 144 parts.

Starting from 0000 hrs

* 0000-0009 hrs = index 0
* 0010-0019 hrs = index 1
* 0020-0029 hrs = index 2
* 0030-0039 hrs = index 3
* 0040-0049 hrs = index 4
* 0050-0059 hrs = index 5
* 0100-0109 hrs = index 6
* .
* .
* .
* .
* 2340-2349 hrs = index 142
* 2350-2359 hrs = index 143

### Tracking

An array of size of 144 elements called `timeWeights` is maintained for every user. Whenever user click on a notification, the weight in the array at position corresponding to the time index of when it was clicked is increased by 1.

This is used to know the active period of the user.

### Main Scheduler

* A cron job runs after every 10 minutes.
* In the cron job
  * Users with notification to be sent are fetched.
  * If a user has crossed the limit, the user is put to hold for 1 day.
  * Else, the weight corresponding to current time is compared with weights from current index till last index 143 in the `timeWeights` of the user.
  * If there is no higher weight, then all the remaining notifications is sent till the limit is reached. If there was a higher weight, then sending of notification is skipped in the current cron job.
* Using the weights for time indices, scheduler selects most appropriate time to send notifications.
