Title: The Art of Decoupled Technology
Date: 2/23/2015
Category: Technology
Tags: website, database, modularity
Authors: Bill Hertzing
FacebookImage: http://blogimages.billhertzing.com/decouple-tech.jpg

![IMAGE DESCRIPTION](http://blogimages.billhertzing.com/decouple-tech.jpg)

Although cloud means shared hosting it gives you the power to decouple technology like never before.  To decouple technology means separating elements that have been traditionally connected into independent infrastructure pieces.  Once this done, these elements can be scaled, modified  or replaced altogether giving your systems better performance and reliability.

## Web & Database

![Web & Database](http://blogimages.billhertzing.com/web-database.jpg)

Traditionally, we ran our web application and database on the same host.  This was mainly done because resources were limited.  Hardware costs were at a premium as well as other factors that came along with running more than one server like heat, square footage, power and network connectivity.

In the cloud, it's best to decouple the web server from the database server.  The first thing this does is spreads the workload over multiple hosts.  Each server now holds its own set of resources to work with.  If one host needs more memory, additional servers can be added in a horizontal configuration.

With the database, additional servers can be created with larger hardware.  The database can be exported and copied over to the new host, the app can then be migrated as the web servers are updated.

## Caching & Sessions

![Caching & Sessions](http://blogimages.billhertzing.com/Varnish-Web.jpg)

Once the advantage is seen in what can be achieved when you decouple web and database, additional technologies can be separated.

We can remove the caching mechanism from the web servers and make it a tier of its own. With the caching tier serving up static content the web servers have additional resources to serve up more dynamic content. 

Additionally, we can separate the session tracking functions to their own tier as well. By doing so you extend the memory pool of your caching software to any size you need.

## Reads and Writes

![Reads and writes](http://blogimages.billhertzing.com/reads-and-writes.jpg)

Data written to and read from databases can generate strain as the system works to answer both requests. Resource exhaustion can occur if there are more requests than the system can handle.   In the cloud, currently, it is difficult to have a full master-master relationship.  That's where you can have multiple systems writing to the same data store.  However, one technique that has emerged is to decouple not the systems but the processes themselves.

In this example, we have decoupled reads and writes.   The writes are directed to the master database.  The master database then is in replication with more than one slave server.  Those servers are then behind a load balancer which distributes the read request workload.  If additional read requests are made that push the servers beyond capacity, more servers can be added.  

It should be noted that this configuration is not typically "turn-key" as it requires the code to be aware of decoupled servers for the different functions.  Most legacy applications that are hard coded for a single system will not be configurable in this manner.

## Queues

![Message Queues](http://blogimages.billhertzing.com/Message-Queue.jpg)

Message queues are another way to decouple your configuration.  Message queues offer a way to buffer the data stream in case the application server processing the data becomes unavailable.  

This is important if you have systems or sensors that are sending data back to be processed as it could be the only instance or record of that event.  You don't want to lose that data should your ability to process it become  unavailable due to maintenance, backlog, network connectivity issues and so on.

Message queues can be offered as a service or are something you can run on your own infrastructure environment.  

## Memory, CPU, Disk and Bandwidth

![Disk CPU Memory Network](http://blogimages.billhertzing.com/Disk-cpu-memory-network.jpg)

With the adoption of the cloud, we are now starting to see an era where the working components of the systems themselves can be decoupled.  Memory, CPU, disk and bandwidth can all be scaled independently based on need.  

The most flexible part of this equation starts with the hard disk.  Leveraging the use of cloud block storage it is possible to attach your disk to a server configuration that favors more memory over anything else.  Or, you can disconnect that volume and boot it using a server that needs greater CPU resources.  Of course, configurations that have more bandwidth throughput are also available should the need arise.  Finally the disk itself can be cloned and made to be of a different size.   

## Conclusion

As cloud technology continues to improve,  more and more ways to decouple technology from what we have traditionally known it will become available. Just recently I saw where the compute function has been decoupled and put onto a stick with an HDMI connector.  Plug the stick into a screen and you control it using wireless input devices.  This article is only an introduction about what is possible.

The important takeaway is to find which methods work best for your situation.  What part of your application needs flexibility and/or scalability the most?  The answers to those questions will then help you decide what should be decoupled first.

Image Source: http://en.wikipedia.org/wiki/Railway_coupling#mediaviewer/File:Scepka.GIF



## Have a comment? ##
So, what do you think? Did I miss anything?  Is any part unclear?

[Send me a message on Twitter](https://twitter.com/BillHertzing)

