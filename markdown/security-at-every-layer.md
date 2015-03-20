Title: Security at Every Layer
Date: 1/21/2015
Category: Technology
Tags: security, cloud, five pillars
Slug: security-at-every-layer
Authors: Bill Hertzing

## Security at each pillar
Back in 2013 [Wayne Walls counted down the five essential pillars of cloudiness](http://www.rackspace.com/blog/pillars-of-cloudiness-no-5-security/).  These pillars are key considerations to keep in mind when building or running applications for the cloud.  Not too long ago this information was updated in a [published white paper on the topic](http://www.rackspace.com/blog/explore-the-five-pillars-of-cloudiness/) and explores these pillars in greater detail.  

The purpose of this post is to touch on the security approaches that should be addressed at every layer.  One of the pillars mentioned is actually called Security.  It might seem circular in thinking as to how security can have security of its own, but I'll touch on that in that section.  In any case, I think you will find each pillar should probably carry its own security considerations.

## Pillar 1: Parallel Computing

Distributed and parallel computing is the idea of rather than running your application on a few pieces of infrastructure you spread them out to other systems.  You can leverage computational power by breaking them up by task.  Or, you can break them up by metrics such as job size, user platform or geo-location.
                
However you do it, you will want to make sure that these systems are secure.  Making sure the worker servers (the ones doing the task) are only speaking to the message servers (the ones assigning the tasks) and nothing else.  This can be accomplished by having specific firewall and access controls for each system in place.

With parallel computing the idea is you have more than one path into your site.  This might be desktop version and a mobile version of your site.  Not just a plug-in that reads what browser you are using but a separate network path specifically designed and separate from other points of entry.  Keeping SSL certificates, for example, across all parallel paths is key to securing not only your but also proving your visitors with a safe and quality experience. 


## Pillar 2: Modular Design

Modular Design means separating parts of an application into smaller pieces.  Similar to what was mentioned earlier, these smaller pieces should only talk to the systems they need to and ignore all the rest.  So, for example, if we are separating a caching mechanism from the application to its own server, it should only be allowed to receive traffic from the systems it supports.

That way should something fail or become compromised, the chances of that activity impacting other elements of the infrastructure becomes reduced.  It also allows for easier troubleshooting should a problem arise.  

Security measures, however, that worked on one system may not be good enough in a modular environment.  Switching to a secure HTTPS rather than unsecure HTTP for your API requests is one illustration.  Where the requests were probably once contained in a single system, these requests might now have to traverse a public network or the Internet itself.  

As network topology changes, going from private to hybrid or bursting into the cloud, make sure your security profiles changes with it.  A real simple example that could be overlooked is when using cloud load balancers.  When servers are deleted, make sure that the nodes are removed from the load balancer since it is common practice for those IP addresses to be reissued.  It would not be good for a person to visit a site and inadvertently arrive at another.

## Pillar 3: Horizontal Scaling

Unlike scaling vertically where you make systems larger, scaling horizontally means adding more systems.  With vertical scaling the security updates and patched software remains in place.  With horizontal scaling, new systems are brought online.  

It is absolutely important that these systems be brought up to speed before being put online.  New systems need not only content but also any security updates and patches.  Failure to do so can put your entire infrastructure at risk.

## Pillar 4: Agility

When cloud traffic patterns change, being agile means your cloud needs to adapt.  Additional resources need to come online and then when no longer need be removed to keep costs in check.

Being agile in terms of security is important as well.  With some systems security is managed at a server-by-server basis.  There are currently ways to be agile with the assistance of 3rd party SaaS tools.  These applications can act as a controller for firewalls, for example, making it easy to apply policies across multiple servers at once.  Additionally, some cloud providers offer the ability to pre-load public keys so as servers come online, they are applied accordingly.  

As good as these systems are they are still independent.  One system is not aware of what the other system is doing.  To add agility, these systems must be configured and designed to work in concert.  Configuration management is a good start for making sure systems meet set standards.  System discovery and automatic configuration are on the horizon that will help administrators be agile and secure at the same time.

## Pillar 5: Security in the Cloud

>#####"Ultimately, security in the cloud is a shared responsibility between you and your cloud hosting provider." - Wayne Walls

This is the fundamental security aspect to consider.  What is the cloud provider bringing to the table?  What will I need to provide?  In the article mentioned at the beginning, Wayne talks about Infrastructure-as-a-Service (IaaS), Platform-as-a-Service (PaaS) and Software-as-a-Service (SaaS) and the security requirements of each.  It's important to know what you are buying for your cloud application.

Security in the cloud is ultimately about people.  Here the fundamentals apply more than ever.  Strong password policies are a start.  Next is role-based access control then two-factor authentication.  Is this enough?  I am sure many of the recently publicized security breaches could be identified as a failure in security fundamentals.

Users getting around policy and walking away with data is a major concern.  One way to address this might be the issue of encryption keys.  My prediction is that employees of the future will be issued a personal key.  These keys will/should be kept on premise.  They should never be kept in the cloud.  This key will be used for the sending of emails and the securing/tracking of sensitive data.

The problem, naturally, is additional overhead.  To leverage the issuance of keys requires additional training, infrastructure and policies.  So, I imagine it will be a while before a balance is ever achieved between ease-of-use and security.    

   
## Conclusion
Security can never be a set-it-and-forget-it matter.  It needs to be tracked, managed and change as your infrastructure changes.


## Have a comment? ##
So, what do you think? Did I miss anything?  Is any part unclear?

[Send me a message on Twitter](https://twitter.com/BillHertzing)


