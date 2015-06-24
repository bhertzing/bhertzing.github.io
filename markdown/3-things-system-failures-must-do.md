Title: 3 Things System Failures Must Do
Date: 6/24/2015
Category: Technology
Tags: failure, system
Authors: Bill Hertzing
FacebookImage: http://blogimages.billhertzing.com/3-things-system-failures-must-do.jpg

![BSOD - 3 Failures](http://blogimages.billhertzing.com/3-things-system-failures-must-do.jpg)

When talking about system failures, I always tell people I speak with that it can and will take place.  To set the right expectation I mention that these systems (some virtual) are constructed by mankind.  It's not a question of "if" but "when" will it break.  Even if the system itself is rock-solid other systems attached (network, power, facility, service supplier, etc.) could give out as well.

When a system fails, I have found there are three key ways that it needs to happen.  These guidelines are intended to minimize additional damage or loss, notify the people who need to know all while being safe.  


## Fail Fast
When the failure happens it should happen right away.  An eminent system failure that drags out over time can cause more damage than if it just failed right away.  

An example of this might be log files filling up a hard drive.  As the system continues to log activity the files grow bigger and bigger. They can grow to the point where log files fill up the entire partition causing the system to go offline and become unavailable.  When this happens an administrator must step in, clear out or backup the log files to regain free space.  

A solution for this would be to set the logs to overwrite after a certain time or size.  Another option might be to put log files on their own partition so that should they fill up the partition, the system stays online.

## Fail Loud
When the failure occurs there should be notification of some kind.  Somebody should immediately know about it and the notification should go to individuals who can address it in a timely fashion.

The use of monitoring is important to running successful systems.  But make sure you have the right kind of monitoring enabled and that those who are accountable for the system know when there is an alert.  My refrigerator has a buzzer on it that if the door is left open, a chime happens.  I can get up and close the door.  

For an online system you will want to know when it deviates from a predetermined standard.   When a website's URL is no longer responding, it would be important to know about the event.  All the services on the servers may still be working correctly but the site is offline.  There should be an alert that checks for that and notifies the administrator who can address the issue.

## Fail Safe
When the error happens, it should fail in a safe manner keeping other systems safe and still providing a quality experience.

An example of this would be if a website fails, there should be a fail-over page that is displayed explaining that they are currently experiencing technical difficulties.  This communicates to the visitors that the site has not gone anywhere and will be back shortly.

A more elaborate example might be if the site or system fails there is a backup system present to take over.  Perhaps if there are two systems that are in concert, one system will fail over automatically to the other keeping functionality in place even if on a limited basis.

## Conclusion
System failures are going to happen.  A true catastrophe requires multiple failures to take place.  This is why it is so important that when it does happen, it is going to do it under the best possible conditions.  Monitoring and reacting to single failures keeps catastrophes at bay.  

## Have a comment? ##
So, what do you think? Did I miss anything?  Is any part unclear?

[Send me a message on Twitter](https://twitter.com/BillHertzing)

