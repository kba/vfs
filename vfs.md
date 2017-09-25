# Feature matrix

<!-- BEGIN-EVAL nodejs test/z.smoke.test.js|sed -e 's/\x1b.[0-9]*m//g' -e '1,3d' |head -n -4 -->
	                    zip  file tar  ar   sftp 
	stat                 X    X    X    X    X   
	mkdir                -    X    -    -    -   
	createReadStream     X    X    X    X    X   
	createWriteStream    -    X    -    -    -   
	readFile             X    X    X    X    X   
	writeFile            X    X    -    -    -   
	unlink               X    X    -    -    -   
	mkdirRecursive       -    X    -    -    -   
	copyFile             X    X    -    -    -   
	getdir               X    X    X    X    X   
	find                 X    X    X    X    X   
	du                   X    X    X    X    X   
	readdir              X    X    X    X    X   
	nextFile             -    -    -    -    -   
	rmdir                -    X    -    -    -   

<!-- END-EVAL -->

