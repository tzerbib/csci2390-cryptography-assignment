---
title: "Assignment 4: Cryptography"
output: pdf
author:
 - "Timothée ZERBIB"
 - "[tzerbib@cs.brown.edu](mailto:tzerbib@cs.brown.edu)"
header-includes: |
    \usepackage [margin=25mm, foot=15mm] {geometry}
    \usepackage{mathtools}
    \usepackage{xcolor}
    \usepackage[onelanguage, ruled, lined]{algorithm2e}

    \usepackage{listings}
    \definecolor{codegreen}{rgb}{0,0.6,0}
    \definecolor{codegray}{rgb}{0.5,0.5,0.5}
    \definecolor{codepurple}{rgb}{0.58,0,0.82}
    \definecolor{backcolour}{rgb}{0.95,0.95,0.92}

    \lstdefinestyle{mystyle}{
        backgroundcolor=\color{backcolour},
        commentstyle=\color{codegreen},
        keywordstyle=\color{magenta},
        numberstyle=\tiny\color{codegray},
        stringstyle=\color{codepurple},
        basicstyle=\ttfamily\footnotesize,
        breakatwhitespace=false,
        breaklines=true,
        captionpos=b,
        keepspaces=true,
        numbers=left,
        numbersep=5pt,
        showspaces=false,
        showstringspaces=false,
        showtabs=false,
        tabsize=2
    }

    \lstset{style=mystyle}

date: "\\today"
---

Every source used to generate this report, as well as all of its graphs,
are available on [github](https://github.com/tzerbib/csci2390-cryptography-assignment).


# MPC Voting Application  

> *Question 1: How many inputs does it each party provide into
> the MPC computation, i.e. how many 0s and 1s? How many inputs are there total
> over all three parties? How many input secret shares does your implementation
> create over all the parties?*

For the MPC voting application to run, every party must participate in the score
of every candidate. Thus, every party provides one input per option (exactly
one 1 for the option it votes for, and one zero per other option).

Thus, across the whole votes of $p$ participants over $o$ options, there are
$p \times o$ inputs that have to be shared with every participants, thus
$p^2 \times o$ secret shares.


> *Question 2: Choose one vote option, say "DuneBrothers", print all
> the share of that vote that each party received from party 1.
> Run the computation multiple times, look at the printed shares.
> What can you tell us about them? Is it obvious to you whether you can use less
> than three of them to reconstruct the secret vote?*

If we just look at the secret shares sent by one client, for a fixed option,
over multiple votes, they just look like random numbers.

It is hard to know if Shamir secret share is a threshold secret sharing algorithm
by just looking at the secret shares.


> *Question 3: Your implementation is secret ballot: no one knows
> what anyone else voted for. Are there other properties that
> such a voting system might need to have? Think about a user cheating,
> e.g. by voting many times to skew the results. Does your implementation
> satisfy the properties you identify? Why/Why not? Suggest some ideas
> for how the implementation can be modified to satisfy them.*

For our secret ballot algorithm to be usable as a voting system, we have
to ensure that every vote is *correct*, and that every user can only vote once.
Supposing that the server relies on an authentication system,
the only once semantic can be achieved alongside with the corectness verification
of the vote (ensuring that each vote is exactly 0 or 1, and that the sum of all
votes of a user is exactly 1).

Remark: by only ensuring that the sum of the votes is exactly one, we end up
with a vote system which allows for users to state preferences among different
options instead of clearly choosing one of them (e.g. option 1:0.2,
option 2: 0.5, option 3: 0.3).


\newpage
> *Bonus Question: Modify your implmenetation to perform sanity checks over
> the vote's secret shares under MPC. Specifically, check that each
> secret vote value is either 0 or 1. Is your program noticably slower
> with these checks? Experiment modifying the modulos of the computation
> (the Zp parameter to JIFF). Does it have any effect on the computation time?*

The program has now to perform MPC for every vote of every client,
which considerably slows it down.

Lower values of the modulo induce faster computation than larger values.

