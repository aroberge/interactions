"use strict";

var cortex = function() { };

cortex.create = function(m,n)
{
	var L = new Array(m);
	
    for (var i = 0; i < m; i++)
	{
		L[i] = new Array(n);
		for (var j = 0; j < n; j++)
		{
			L[i][j] = 0;
		}
	}
	
	return L;
}

cortex.cholesky = function(A) {
	var n = A.length;
    
	var L = cortex.create(n,n);
	
    for (var i = 0; i < n; i++)
	{
        for (var j = 0; j < (i+1); j++) {
            var s = 0;
            for (var k = 0; k < j; k++)
                s += L[i][k] * L[j][k];
            L[i][+ j] = (i == j) ?
                           Math.sqrt(A[i][i] - s) :
                           (1.0 / L[j][j] * (A[i][j] - s));
        }
	}
	
    return L;
}
/*

// QR decomposition in pure javascript
cortex.qr = function (mat) {
    var m = mat.length, n = mat[0].length;
    var Q = numeric.identity(m);
    var R = numeric.clone(mat);

    for (var k = 1; k < Math.min(m, n); k++) {
        var ak = R.slice(k, 0, k, k).col(1);
        var oneZero = [1];

        while (oneZero.length <= m - k)
            oneZero.push(0);

        oneZero = $V(oneZero);
        var vk = ak.add(oneZero.x(ak.norm() * Math.sign(ak.e(1))));
        var Vk = $M(vk);
        var Hk = Matrix.I(m - k + 1).subtract(Vk.x(2).x(Vk.transpose()).div(Vk.transpose().x(Vk).e(1, 1)));
        var Qk = identSize(Hk, m, n, k);
        R = Qk.x(R);
        // slow way to compute Q
        Q = Q.x(Qk);
    }

    return {
        Q: Q,
        R: R
    };
}*/

