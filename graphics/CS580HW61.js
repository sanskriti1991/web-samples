function NewFrameBuffer(ctx, width, height) {
    return ctx.createImageData(width, height);
}

function NewDisplay(c) {
    return c.getContext("2d");
}
function InitDisplay(ctx, finalimageData) {
    //initializing image data for background color
    for (var h = 0; h < 4 * width * height; h += 4) {
        finalimageData.data[h + 0] = 128;
        finalimageData.data[h + 1] = 112;
        finalimageData.data[h + 2] = 96;
        finalimageData.data[h + 3] = 0xff;
    }
    for (var i = 0; i < 6; i++) {
        for (var h = 0; h < 4 * width * height; h += 4) {
            imageData[i][h + 0] = 128;
            imageData[i][h + 1] = 112;
            imageData[i][h + 2] = 96;
            imageData[i][h + 3] = 0xff;
        }

        for (var k = 0; k < width * height; k++) {
            zbuffer[i][k] = Infinity;
        }
    }
}

function InitializeStates() {
    color.r = 128;
    color.b = 128;
    color.g = 128;
    return true;
}

function SetStateVariable(rgb, c) {
    if (interpolate == 0) {
        color.r = rgb * c.r;
        color.g = rgb * c.g;
        color.b = rgb * c.b;
    }
    if (interpolate == 1) {
        for (i = 0; i < 3; i++) {
            color[i].r = rgb * c[i].r;
            color[i].g = rgb * c[i].g;
            color[i].b = rgb * c[i].b;
        }
    }
}

function Display(ctx) {
    finalImageRender();
    ctx.clearRect(0, 0, 256, 256);
    return ctx.putImageData(finalimageData, 0, 0);
}

function finalImageRender() {
    
    var sumr = 0, sumg = 0, sumb = 0;
    
    for (var h = 0; h < 4 * width * height; h += 4) {
        sumr = 0; sumg = 0; sumb = 0;
        for (var i = 0; i < 6; i++) {
            sumr += ((imageData[i][h + 0]) * weight[i])
            sumg += ((imageData[i][h + 1]) * weight[i]);
            sumb += ((imageData[i][h + 2]) * weight[i]);
        }
        finalimageData.data[h + 0] = sumr;
        finalimageData.data[h + 1] = sumg;
        finalimageData.data[h + 2] = sumb;
        finalimageData.data[h + 3] = 255;
    }
}

function FlushDisplayToPPMFile() {
    var finalimageData = ctx.getImageData(0, 0, 256, 256);
    for (var o = 0; o < finalimageData.data.length; o += 4) {
        output += finalimageData.data[o] + " ";
        output += finalimageData.data[o + 1] + " ";
        output += finalimageData.data[o + 2] + " ";
    }
    window.open().document.write(output);
    location.reload();
}

function setPixel(imageData, x, y, r, g, b, a) {
    var h = (x + y * finalimageData.width) * 4;
    imageData[h + 0] = r;
    imageData[h + 1] = g;
    imageData[h + 2] = b;
    imageData[h + 3] = a;
}
//texture lookup
function texture(s, t) {
    if (s < 0) s = 0;
    if (t < 0) t = 0;
    if (s > 1) s = 1;
    if (t > 1) t = 1;

    var S, T; var C = { r: 0, g: 0, b: 0 };
    S = s * (TexWidth - 1);
    T = t * (TexHeight - 1);

    //bilinear interpolation
    var floorS, ceilS, floorT, ceilT;
    floorS = Math.floor(S); floorT = Math.floor(T);
    ceilS = Math.ceil(S); ceilT = Math.ceil(T);
    fs = S - floorS;
    ft = T - floorT;

    C.r = ((fs) * (ft) * Texture[ceilS + ceilT * TexWidth].R) + ((1 - fs) * (ft) * Texture[floorS + ceilT * TexWidth].R) + ((fs) * (1 - ft) * Texture[ceilS + floorT * TexWidth].R) + ((1 - fs) * (1 - ft) * Texture[floorS + floorT * TexWidth].R);
    C.g = ((fs) * (ft) * Texture[ceilS + ceilT * TexWidth].G) + ((1 - fs) * (ft) * Texture[floorS + ceilT * TexWidth].G) + ((fs) * (1 - ft) * Texture[ceilS + floorT * TexWidth].G) + ((1 - fs) * (1 - ft) * Texture[floorS + floorT * TexWidth].G);
    C.b = ((fs) * (ft) * Texture[ceilS + ceilT * TexWidth].B) + ((1 - fs) * (ft) * Texture[floorS + ceilT * TexWidth].B) + ((fs) * (1 - ft) * Texture[ceilS + floorT * TexWidth].B) + ((1 - fs) * (1 - ft) * Texture[floorS + floorT * TexWidth].B);

    return C;
}
//texture lookup
function proceduraltexture(s, t) {
    // MandelBrot Texture equation from slides and wikipedia
    if (s < 0) s = 0;
    if (t < 0) t = 0;
    if (s > 1) s = 1;
    if (t > 1) t = 1;

    var X = { r: 0, i: 0 }, C = { r: 0, i: 0 }; var Color = { r: 0, g: 0, b: 0 };
    X.r = 0;
    X.i = 0;
    var escapeR = 3;
    C.r = escapeR * s - 1.5 //shift the pattern in the plane 
    C.i = escapeR * t - 1.5 //shift the pattern 
    var i = 0;
    while (i <= 50 && (X.r * X.r + X.i * X.i) < escapeR * escapeR) {
        tempr = (X.r * X.r - X.i * X.i) + C.r;
        tempi = (2 * X.r * X.i) + C.i;
        X.r = tempr;
        X.i = tempi;
        i++;
    }
    //c between 0 and 1;
    var c = (i / 50);
    Color.r = c;
    Color.g = c;
    Color.b = c;

    return Color;
}
//[0,1] color to be mapped to [0,255]
var specularSum1 = new Array(3);
function ComputeTriangleColor(normal) {

    //shading equations
    var nLength;
    var lLength;
    var nunitx;
    var nunity;
    var nunitz;
    var lunitx;
    var lunity;
    var lunitz;
    //r for all the vertices of triangle
    var R1;
    var R2;
    var R3;
    var diffuseSum1 = new Array(3);
    var RV1, RV2, RV3;
    var ndotv;
    var eye = { x: 0, y: 0, z: -1 };
    var Coeff = { r: 0, g: 0, b: 0 };

    diffuseSum1[0] = 0;
    diffuseSum1[1] = 0;
    diffuseSum1[2] = 0;
    specularSum1[0] = 0;
    specularSum1[1] = 0;
    specularSum1[2] = 0;

    //L.N vector for vertex 1 and light1
    for (i = 0; i < light.length; i++) {
        nLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        nunitx = normal.x / nLength;
        nunity = normal.y / nLength;
        nunitz = normal.z / nLength;

        lLength = Math.sqrt(light[i].direction.x * light[i].direction.x + light[i].direction.y * light[i].direction.y + light[i].direction.z * light[i].direction.z);
        lunitx = light[i].direction.x / lLength;
        lunity = light[i].direction.y / lLength;
        lunitz = light[i].direction.z / lLength;

        vLength = Math.sqrt(eye.x * eye.x + eye.y * eye.y + eye.z * eye.z);
        vunitx = eye.x / vLength;
        vunity = eye.y / vLength;
        vunitz = eye.z / vLength;

        ldotn = lunitx * nunitx + lunity * nunity + lunitz * nunitz;
        ndotv = vunitx * nunitx + vunity * nunity + vunitz * nunitz;
        if ((ldotn < 0 && ndotv < 0) || (ldotn >= 0 && ndotv >= 0)) {
            if (ldotn < 0 && ndotv < 0) {
                nunitx = -nunitx;
                nunity = -nunity;
                nunitz = -nunitz;
                ldotn = -ldotn;
            }
            diffuseSum1[0] += light[i].color.r * ldotn;
            diffuseSum1[1] += light[i].color.g * ldotn;
            diffuseSum1[2] += light[i].color.b * ldotn;
            //R = 2(ldotn)n -l
            R1 = { x: 2 * ldotn * nunitx - lunitx, y: 2 * ldotn * nunity - lunity, z: 2 * ldotn * nunitz - lunitz };
            R1Length = Math.sqrt(R1.x * R1.x + R1.y * R1.y + R1.z * R1.z);
            R1.x = R1.x / R1Length;
            R1.y = R1.y / R1Length;
            R1.z = R1.z / R1Length;
            //R.V for V1
            var rdotv = R1.x * vunitx + R1.y * vunity + R1.z * vunitz;
            if (rdotv < 0.0)
            { rdotv = 0.0; }
            else if (rdotv > 1.0)
            { rdotv = 1.0; }

            specularSum1[0] += light[i].color.r * (Math.pow(rdotv, 32));
            specularSum1[1] += light[i].color.g * (Math.pow(rdotv, 32));
            specularSum1[2] += light[i].color.b * (Math.pow(rdotv, 32));


        }
    }
    var newColor = { r: ambientCoefficient.r * ambientlight.color.r + diffuseCoefficient.r * diffuseSum1[0] + specularCoefficient.r * specularSum1[0], g: ambientCoefficient.g * ambientlight.color.g + diffuseCoefficient.g * diffuseSum1[1] + specularCoefficient.g * specularSum1[1], b: ambientCoefficient.b * ambientlight.color.b + diffuseCoefficient.b * diffuseSum1[2] + specularCoefficient.b * specularSum1[2] };
    if (interpolate == 1 && textureMode != 0) {
        newColor = { r: ambientlight.color.r + diffuseSum1[0] + specularSum1[0], g: ambientlight.color.g + diffuseSum1[1] + specularSum1[1], b: ambientlight.color.b + diffuseSum1[2] + specularSum1[2] };
    }
    if (interpolate == 2 && textureMode != 0) {
        newColor = { r: ambientlight.color.r + diffuseSum1[0], g: ambientlight.color.g + diffuseSum1[1], b: ambientlight.color.b + diffuseSum1[2] };
    }
    if (newColor.r > 1)
    { newColor.r = 1; }

    if (newColor.g > 1)
    { newColor.g = 1; }

    if (newColor.b > 1)
    { newColor.b = 1; }

    if (newColor.r < 0)
    { newColor.r = 0; }

    if (newColor.g < 0)
    { newColor.g = 0; }

    if (newColor.b < 0)
    { newColor.b = 0; }

    return newColor;
}
//area of triangle for barycentric weights
function areaOfTriangle(ax, ay, px, py, bx, by) {
    return Math.abs((ax * (py - by) + px * (by - ay) + bx * (ay - py)) / 2);
}
function sortVertices(tri) {
    x1 = Math.max(tri[0][0], tri[1][0], tri[2][0]);
    if (x1 == tri[0][0]) {
        y1 = tri[0][1];
        x1y1color = color[0];
        normalx1y1 = normalV1;
        sv1 = s1;
        tv1 = t1;
        x0 = Math.min(tri[1][0], tri[2][0]);
        if (x0 == tri[1][0]) {
            y0 = tri[1][1];
            x0y0color = color[1];
            normalx0y0 = normalV2;
            sv0 = s2;
            tv0 = t2;
            x2 = tri[2][0];
            y2 = tri[2][1];
            x2y2color = color[2];
            normalx2y2 = normalV3;
            sv2 = s3;
            tv2 = t3;
        }
        else {
            y0 = tri[2][1];
            x2 = tri[1][0];
            y2 = tri[1][1];
            x0y0color = color[2];
            normalx0y0 = normalV3;
            sv0 = s3;
            tv0 = t3;
            x2y2color = color[1];
            normalx2y2 = normalV2;
            sv2 = s2;
            tv2 = t2;
        }
    }
    if (x1 == tri[1][0]) {
        y1 = tri[1][1];
        x1y1color = color[1];
        normalx1y1 = normalV2;
        sv1 = s2;
        tv1 = t2;
        x0 = Math.min(tri[0][0], tri[2][0]);
        if (x0 == tri[2][0]) {
            y0 = tri[2][1];
            x2 = tri[0][0];
            y2 = tri[0][1];
            x0y0color = color[2];
            sv0 = s3;
            tv0 = t3;
            x2y2color = color[0];
            normalx0y0 = normalV3;
            normalx2y2 = normalV1;
            sv2 = s1;
            tv2 = t1;
        }
        else {
            y0 = tri[0][1];
            x2 = tri[2][0];
            y2 = tri[2][1];
            x0y0color = color[0];
            x2y2color = color[2];
            normalx0y0 = normalV1;
            normalx2y2 = normalV3;
            sv0 = s1;
            tv0 = t1;
            sv2 = s3;
            tv2 = t3;
        }
    }
    if (x1 == tri[2][0]) {
        y1 = tri[2][1];
        x1y1color = color[2];
        normalx1y1 = normalV3;
        sv1 = s3;
        tv1 = t3;
        x0 = Math.min(tri[1][0], tri[0][0]);
        if (x0 == tri[1][0]) {
            y0 = tri[1][1];
            x2 = tri[0][0];
            y2 = tri[0][1];
            x0y0color = color[1];
            x2y2color = color[0];
            normalx0y0 = normalV2;
            normalx2y2 = normalV1;
            sv0 = s2;
            tv0 = t2;
            sv2 = s1;
            tv2 = t1;
        }
        else {
            y0 = tri[0][1];
            x2 = tri[1][0];
            y2 = tri[1][1];
            x0y0color = color[0];
            x2y2color = color[1];

            normalx0y0 = normalV1;
            normalx2y2 = normalV2;
            sv0 = s1;
            tv0 = t1;
            sv2 = s2;
            tv2 = t2;
        }
    }
}

function leeAlgo(x0, y0, x2, y2, x1, y1,index) {
    var l = 0; var q = 0;
    if (interpolate == 0) {
        for (l = Math.floor(Math.min(x0, x1, x2)) ; l < Math.ceil(Math.max(x0, x1, x2)) ; l++) {
            for (q = Math.floor(Math.min(y0, y1, y2)) ; q < Math.ceil(Math.max(y0, y1, y2)) ; q++) {
                var eq = new Array(3);
                var eqNew = new Array(3);
                //edge (x0 to x1)
                dY = y1 - y0;
                dX = x1 - x0;
                eq[0] = dY * (l - x1) - dX * (q - y1);
                eqNew[0] = dY * (x2 - x1) - dX * (y2 - y1);
                //edge (x1 to x2)
                dY = y2 - y1;
                dX = x2 - x1;
                eq[1] = dY * (l - x2) - dX * (q - y2);
                eqNew[1] = dY * (x0 - x2) - dX * (y0 - y2);
                //edge (x2 to x0)
                dY = y0 - y2;
                dX = x0 - x2;
                eq[2] = dY * (l - x0) - dX * (q - y0);
                eqNew[2] = dY * (x1 - x0) - dX * (y1 - y0);
                if ((eq[0] * eqNew[0] >= 0 && eq[1] * eqNew[1] >= 0 && eq[2] * eqNew[2] >= 0)) {
                    z = (D - (A * l) - (B * q)) / C;
                    var h = (l + q * finalimageData.width);
                    if (z < zbuffer[index][h]) {
                        zbuffer[index][h] = z;
                        // checking boundary limits for the entire image
                        if (l < 0)
                            l = 0.0;
                        if (q < 0)
                            q = 0.0;

                        if (l > 256)
                            l = 256.0;
                        if (q > 256)
                            q = 256.0;

                        setPixel(imageData[index], l, q, color.r , color.g, color.b , 255);
                    }
                }
            }
        }
    }
    if (interpolate == 1) {
        var k = c = ya = yb = 0; var lar = lag = lab = lbr = lbg = lbb = 0, Car, Cag, Cab, Cbr, Cbg, Cbb, Cpr, Cpg, Cpb;
        var Tas, Tat, Tbs, Tbt, Tps, Tpt;
        var eqx0x2 = 0, eqx2x1 = 0, eqx0x1 = 0;
        var Area = areaOfTriangle(x0, y0, x2, y2, x1, y1);
        var alpha, beta, gamma;
        for (l = Math.ceil(Math.min(x0, x1, x2)) ; l < Math.ceil(Math.max(x0, x1, x2)) ; l++) {
            c = 0;
            for (q = Math.ceil(Math.min(y0, y1, y2)) ; q < Math.ceil(Math.max(y0, y1, y2)) ; q++) {
                var eq = new Array(3);
                var eqNew = new Array(3);
                //edge (x0 to x1)
                dY = y1 - y0;
                dX = x1 - x0;
                eq[0] = (dY * (l - x1)) - (dX * (q - y1));
                eqNew[0] = (dY * (x2 - x1)) - (dX * (y2 - y1));
                //edge (x1 to x2)
                dY = y2 - y1;
                dX = x2 - x1;
                eq[1] = (dY * (l - x2)) - (dX * (q - y2));
                eqNew[1] = (dY * (x0 - x2)) - (dX * (y0 - y2));
                //edge (x2 to x0)
                dY = y0 - y2;
                dX = x0 - x2;
                eq[2] = (dY * (l - x0)) - (dX * (q - y0));
                eqNew[2] = (dY * (x1 - x0)) - (dX * (y1 - y0));
                if ((eq[0] * eqNew[0] >= 0 && eq[1] * eqNew[1] >= 0 && eq[2] * eqNew[2] >= 0)) {
                    if (c == 0) {
                        ya = q;
                        yb = q;
                        c++
                    }
                    else if (q > yb) {
                        yb = q;
                    }
                }
            }
            for (k = ya; k <= yb; k++) {
                var eq = new Array(3);
                var eqNew = new Array(3);
                //edge (x0 to x1)
                dY = y1 - y0;
                dX = x1 - x0;
                eq[0] = (dY * (l - x1)) - (dX * (k - y1));
                eqNew[0] = (dY * (x2 - x1)) - (dX * (y2 - y1));
                //edge (x1 to x2)
                dY = y2 - y1;
                dX = x2 - x1;
                eq[1] = (dY * (l - x2)) - (dX * (k - y2));
                eqNew[1] = (dY * (x0 - x2)) - (dX * (y0 - y2));
                //edge (x2 to x0)
                dY = y0 - y2;
                dX = x0 - x2;
                eq[2] = (dY * (l - x0)) - (dX * (k - y0));
                eqNew[2] = (dY * (x1 - x0)) - (dX * (y1 - y0));
                if ((eq[0] * eqNew[0] >= 0 && eq[1] * eqNew[1] >= 0 && eq[2] * eqNew[2] >= 0)) {

                    z = (D - (A * l) - (B * k)) / C;
                    var h = (l + k * finalimageData.width);
                    if (z < zbuffer[index][h]) {
                        zbuffer[index][h] = z;
                        //calculating new l from ya and yb
                        var eqlya = new Array(3);
                        var eqlyb = new Array(3);
                        dY = y1 - y0;
                        dX = (x1) - (x0);
                        eqlya[0] = ((dX * (ya - y1)) / dY) + x1;
                        dY = (y2) - (y1);
                        dX = (x2) - (x1);
                        eqlya[1] = ((dX * (ya - y2)) / dY) + x2;
                        dY = (y0) - (y2);
                        dX = (x0) - (x2);
                        eqlya[2] = ((dX * (ya - y0)) / dY) + x0;

                        dY = y1 - y0;
                        dX = (x1) - (x0);
                        eqlyb[0] = ((dX * (yb - y1)) / dY) + x1;
                        dY = (y2) - (y1);
                        dX = (x2) - (x1);
                        eqlyb[1] = ((dX * (yb - y2)) / dY) + x2;
                        dY = (y0) - (y2);
                        dX = (x0) - (x2);
                        eqlyb[2] = ((dX * (yb - y0)) / dY) + x0;
                        //calculating new y from l
                        var eqly1 = new Array(3);
                        dY = y1 - y0;
                        dX = (x1) - (x0);
                        eqly1[0] = ((dY * (l - x1)) / dX) + y1;
                        dY = (y2) - (y1);
                        dX = (x2) - (x1);
                        eqly1[1] = ((dY * (l - x2)) / dX) + y2;
                        dY = (y0) - (y2);
                        dX = (x0) - (x2);
                        eqly1[2] = ((dY * (l - x0)) / dX) + y0;

                        //color at ya
                        if (Math.min(Math.abs(eqlya[0] - l), Math.abs(eqlya[1] - l), Math.abs(eqlya[2] - l)) == Math.abs((eqlya[0]) - l)) {
                            if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[0]) - ya)) {

                                Car = (((x1 - l) / (x1 - x0)) * x0y0color.r) + (((l - x0) / (x1 - x0)) * x1y1color.r);
                                Cag = (((x1 - l) / (x1 - x0)) * x0y0color.g) + (((l - x0) / (x1 - x0)) * x1y1color.g);
                                Cab = (((x1 - l) / (x1 - x0)) * x0y0color.b) + (((l - x0) / (x1 - x0)) * x1y1color.b);
                            }

                            else if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[1]) - ya)) {
                                Car = (((x1 - l) / (x1 - x2)) * x2y2color.r) + (((l - x2) / (x1 - x2)) * x1y1color.r);
                                Cag = (((x1 - l) / (x1 - x2)) * x2y2color.g) + (((l - x2) / (x1 - x2)) * x1y1color.g);
                                Cab = (((x1 - l) / (x1 - x2)) * x2y2color.b) + (((l - x2) / (x1 - x2)) * x1y1color.b);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[2]) - ya)) {
                                Car = (((x2 - l) / (x2 - x0)) * x0y0color.r) + (((l - x0) / (x2 - x0)) * x2y2color.r);
                                Cag = (((x2 - l) / (x2 - x0)) * x0y0color.g) + (((l - x0) / (x2 - x0)) * x2y2color.g);
                                Cab = (((x2 - l) / (x2 - x0)) * x0y0color.b) + (((l - x0) / (x2 - x0)) * x2y2color.b);
                            }
                        }
                        if (Math.min(Math.abs(eqlya[0] - l), Math.abs(eqlya[1] - l), Math.abs(eqlya[2] - l)) == Math.abs((eqlya[1]) - l)) {
                            if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[0]) - ya)) {

                                Car = (((x1 - l) / (x1 - x0)) * x0y0color.r) + (((l - x0) / (x1 - x0)) * x1y1color.r);
                                Cag = (((x1 - l) / (x1 - x0)) * x0y0color.g) + (((l - x0) / (x1 - x0)) * x1y1color.g);
                                Cab = (((x1 - l) / (x1 - x0)) * x0y0color.b) + (((l - x0) / (x1 - x0)) * x1y1color.b);
                            }

                            else if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[1]) - ya)) {
                                Car = (((x1 - l) / (x1 - x2)) * x2y2color.r) + (((l - x2) / (x1 - x2)) * x1y1color.r);
                                Cag = (((x1 - l) / (x1 - x2)) * x2y2color.g) + (((l - x2) / (x1 - x2)) * x1y1color.g);
                                Cab = (((x1 - l) / (x1 - x2)) * x2y2color.b) + (((l - x2) / (x1 - x2)) * x1y1color.b);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[2]) - ya)) {
                                Car = (((x2 - l) / (x2 - x0)) * x0y0color.r) + (((l - x0) / (x2 - x0)) * x2y2color.r);
                                Cag = (((x2 - l) / (x2 - x0)) * x0y0color.g) + (((l - x0) / (x2 - x0)) * x2y2color.g);
                                Cab = (((x2 - l) / (x2 - x0)) * x0y0color.b) + (((l - x0) / (x2 - x0)) * x2y2color.b);
                            }
                        }
                        if (Math.min(Math.abs(eqlya[0] - l), Math.abs(eqlya[1] - l), Math.abs(eqlya[2] - l)) == Math.abs((eqlya[2]) - l)) {
                            if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[0]) - ya)) {

                                Car = (((x1 - l) / (x1 - x0)) * x0y0color.r) + (((l - x0) / (x1 - x0)) * x1y1color.r);
                                Cag = (((x1 - l) / (x1 - x0)) * x0y0color.g) + (((l - x0) / (x1 - x0)) * x1y1color.g);
                                Cab = (((x1 - l) / (x1 - x0)) * x0y0color.b) + (((l - x0) / (x1 - x0)) * x1y1color.b);
                            }

                            else if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[1]) - ya)) {
                                Car = (((x1 - l) / (x1 - x2)) * x2y2color.r) + (((l - x2) / (x1 - x2)) * x1y1color.r);
                                Cag = (((x1 - l) / (x1 - x2)) * x2y2color.g) + (((l - x2) / (x1 - x2)) * x1y1color.g);
                                Cab = (((x1 - l) / (x1 - x2)) * x2y2color.b) + (((l - x2) / (x1 - x2)) * x1y1color.b);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[2]) - ya)) {
                                Car = (((x2 - l) / (x2 - x0)) * x0y0color.r) + (((l - x0) / (x2 - x0)) * x2y2color.r);
                                Cag = (((x2 - l) / (x2 - x0)) * x0y0color.g) + (((l - x0) / (x2 - x0)) * x2y2color.g);
                                Cab = (((x2 - l) / (x2 - x0)) * x0y0color.b) + (((l - x0) / (x2 - x0)) * x2y2color.b);
                            }
                        }

                        //color at yb
                        if (Math.min(Math.abs(eqlyb[0] - l), Math.abs(eqlyb[1] - l), Math.abs(eqlyb[2] - l)) == Math.abs((eqlyb[0]) - l)) {
                            if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[0]) - yb)) {
                                Cbr = (((x1 - l) / (x1 - x0)) * x0y0color.r) + (((l - x0) / (x1 - x0)) * x1y1color.r);
                                Cbg = (((x1 - l) / (x1 - x0)) * x0y0color.g) + (((l - x0) / (x1 - x0)) * x1y1color.g);
                                Cbb = (((x1 - l) / (x1 - x0)) * x0y0color.b) + (((l - x0) / (x1 - x0)) * x1y1color.b);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[1]) - yb)) {
                                Cbr = (((x1 - l) / (x1 - x2)) * x2y2color.r) + (((l - x2) / (x1 - x2)) * x1y1color.r);
                                Cbg = (((x1 - l) / (x1 - x2)) * x2y2color.g) + (((l - x2) / (x1 - x2)) * x1y1color.g);
                                Cbb = (((x1 - l) / (x1 - x2)) * x2y2color.b) + (((l - x2) / (x1 - x2)) * x1y1color.b);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[2]) - yb)) {
                                Cbr = (((x2 - l) / (x2 - x0)) * x0y0color.r) + (((l - x0) / (x2 - x0)) * x2y2color.r);
                                Cbg = (((x2 - l) / (x2 - x0)) * x0y0color.g) + (((l - x0) / (x2 - x0)) * x2y2color.g);
                                Cbb = (((x2 - l) / (x2 - x0)) * x0y0color.b) + (((l - x0) / (x2 - x0)) * x2y2color.b);
                            }
                        }
                        if (Math.min(Math.abs(eqlyb[0] - l), Math.abs(eqlyb[1] - l), Math.abs(eqlyb[2] - l)) == Math.abs((eqlyb[1]) - l)) {
                            if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[0]) - yb)) {
                                Cbr = (((x1 - l) / (x1 - x0)) * x0y0color.r) + (((l - x0) / (x1 - x0)) * x1y1color.r);
                                Cbg = (((x1 - l) / (x1 - x0)) * x0y0color.g) + (((l - x0) / (x1 - x0)) * x1y1color.g);
                                Cbb = (((x1 - l) / (x1 - x0)) * x0y0color.b) + (((l - x0) / (x1 - x0)) * x1y1color.b);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[1]) - yb)) {
                                Cbr = (((x1 - l) / (x1 - x2)) * x2y2color.r) + (((l - x2) / (x1 - x2)) * x1y1color.r);
                                Cbg = (((x1 - l) / (x1 - x2)) * x2y2color.g) + (((l - x2) / (x1 - x2)) * x1y1color.g);
                                Cbb = (((x1 - l) / (x1 - x2)) * x2y2color.b) + (((l - x2) / (x1 - x2)) * x1y1color.b);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[2]) - yb)) {
                                Cbr = (((x2 - l) / (x2 - x0)) * x0y0color.r) + (((l - x0) / (x2 - x0)) * x2y2color.r);
                                Cbg = (((x2 - l) / (x2 - x0)) * x0y0color.g) + (((l - x0) / (x2 - x0)) * x2y2color.g);
                                Cbb = (((x2 - l) / (x2 - x0)) * x0y0color.b) + (((l - x0) / (x2 - x0)) * x2y2color.b);
                            }
                        }
                        if (Math.min(Math.abs(eqlyb[0] - l), Math.abs(eqlyb[1] - l), Math.abs(eqlyb[2] - l)) == Math.abs((eqlyb[2]) - l)) {
                            if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[0]) - yb)) {
                                Cbr = (((x1 - l) / (x1 - x0)) * x0y0color.r) + (((l - x0) / (x1 - x0)) * x1y1color.r);
                                Cbg = (((x1 - l) / (x1 - x0)) * x0y0color.g) + (((l - x0) / (x1 - x0)) * x1y1color.g);
                                Cbb = (((x1 - l) / (x1 - x0)) * x0y0color.b) + (((l - x0) / (x1 - x0)) * x1y1color.b);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[1]) - yb)) {
                                Cbr = (((x1 - l) / (x1 - x2)) * x2y2color.r) + (((l - x2) / (x1 - x2)) * x1y1color.r);
                                Cbg = (((x1 - l) / (x1 - x2)) * x2y2color.g) + (((l - x2) / (x1 - x2)) * x1y1color.g);
                                Cbb = (((x1 - l) / (x1 - x2)) * x2y2color.b) + (((l - x2) / (x1 - x2)) * x1y1color.b);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[2]) - yb)) {
                                Cbr = (((x2 - l) / (x2 - x0)) * x0y0color.r) + (((l - x0) / (x2 - x0)) * x2y2color.r);
                                Cbg = (((x2 - l) / (x2 - x0)) * x0y0color.g) + (((l - x0) / (x2 - x0)) * x2y2color.g);
                                Cbb = (((x2 - l) / (x2 - x0)) * x0y0color.b) + (((l - x0) / (x2 - x0)) * x2y2color.b);
                            }
                        }

                        if (l < 0)
                            l = 0.0;
                        if (k < 0)
                            k = 0.0;


                        if (l > 256)
                            l = 256.0;
                        if (k > 256)
                            k = 256.0;
                        var Kt = { r: 1, g: 1, b: 1 };

                        var vz = z / (zmax - z);

                        if (k == ya) {

                            if (textureMode != 0) {
                                //interpolating texture coordinates
                                gamma = areaOfTriangle(x0, y0, l, k, x2, y2) / Area;
                                beta = areaOfTriangle(x0, y0, l, k, x1, y1) / Area;
                                alpha = 1 - gamma - beta;
                                Tas = (alpha * sv0) + (beta * sv2) + (gamma * sv1);
                                Tat = (alpha * tv0) + (beta * tv2) + (gamma * tv1);

                                if (textureMode == 1) {
                                    Tas = Tas * (vz + 1);
                                    Tat = Tat * (vz + 1);
                                    Kt = texture(Tas, Tat);

                                }
                                if (textureMode == 2) {
                                    Tas = Tas * (vz + 1);
                                    Tat = Tat * (vz + 1);
                                    Kt = proceduraltexture(Tas, Tat);
                                }

                                Car = RGB_COLOR * (Kt.r * Car); Cag = RGB_COLOR * Kt.g * Cag; Cab = RGB_COLOR * Kt.b * Cab;
                                setPixel(imageData[index], l, k, (Car), (Cag), (Cab), 255);
                            } else {
                                setPixel(imageData[index], l, k, (RGB_COLOR * Car), (RGB_COLOR * Cag), (RGB_COLOR * Cab), 255);
                            }
                        }
                        if (k == yb) {
                            if (textureMode != 0) {
                            //interpolating texture coordinates
                            gamma = areaOfTriangle(x0, y0, l, k, x2, y2) / Area;
                            beta = areaOfTriangle(x0, y0, l, k, x1, y1) / Area;
                            alpha = 1 - gamma - beta;
                            Tbs = (alpha * sv0) + (beta * sv2) + (gamma * sv1);
                            Tbt = (alpha * tv0) + (beta * tv2) + (gamma * tv1);

                            if (textureMode == 1) {
                                Tbs = Tbs * (vz + 1);
                                Tbt = Tbt * (vz + 1);
                                Kt = texture(Tbs, Tbt);
                            }
                            if (textureMode == 2) {
                                Tbs = Tbs * (vz + 1);
                                Tbt = Tbt * (vz + 1);
                                Kt = proceduraltexture(Tbs, Tbt);
                            }
                                Cbr = RGB_COLOR * (Kt.r * Cbr); Cbg = RGB_COLOR * Kt.g * Cbg; Cbb = RGB_COLOR * Kt.b * Cbb;
                                setPixel(imageData[index], l, k, (Cbr), (Cbg), (Cbb), 255);
                            }
                            else {
                                setPixel(imageData[index], l, k, (RGB_COLOR * Cbr), (RGB_COLOR * Cbg), (RGB_COLOR * Cbb), 255);
                            }
                        }
                        if (k != ya && k != yb) {

                            if (textureMode != 0) {
                                gamma = areaOfTriangle(x0, y0, l, k, x2, y2) / Area;
                                beta = areaOfTriangle(x0, y0, l, k, x1, y1) / Area;
                                alpha = 1 - gamma - beta;
                                Tps = (alpha * sv0) + (beta * sv2) + (gamma * sv1);
                                Tpt = (alpha * tv0) + (beta * tv2) + (gamma * tv1);

                                if (textureMode == 2) {
                                    Tps = Tps * (vz + 1);
                                    Tpt = Tpt * (vz + 1);
                                    Kt = proceduraltexture(Tps, Tpt);
                                } else {
                                    Tps = Tps * (vz + 1);
                                    Tpt = Tpt * (vz + 1);
                                    Kt = texture(Tps, Tpt);
                                }
                            }
                            Cpr = (((yb - k) / (yb - ya)) * Car) + (((k - ya) / (yb - ya)) * Cbr);
                            Cpg = (((yb - k) / (yb - ya)) * Cag) + (((k - ya) / (yb - ya)) * Cbg);
                            Cpb = (((yb - k) / (yb - ya)) * Cab) + (((k - ya) / (yb - ya)) * Cbb);

                            if (textureMode != 0) {
                                Cpr = RGB_COLOR * (Kt.r * Cpr); Cpg = RGB_COLOR * Kt.g * Cpg; Cpb = RGB_COLOR * Kt.b * Cpb;
                                setPixel(imageData[index], l, k, (Cpr), (Cpg), (Cpb), 255);
                            } else {
                                setPixel(imageData[index], l, k, (RGB_COLOR * Cpr), (RGB_COLOR * Cpg), (RGB_COLOR * Cpb), 255);
                            }

                        }

                    }
                }
            }

        }
    }
    if (interpolate == 2) {
        var Tas, Tat, Tbs, Tbt, Tps, Tpt;
        var k = c = ya = yb = 0; var lar = lag = lab = lbr = lbg = lbb = 0, Nax, Nay, Naz, Nbx, Nby, Nbz, Npx, Npy, Npz, Ca, Cb, Cp;
        var eqx0x2 = 0, eqx2x1 = 0, eqx0x1 = 0;
        var Area = areaOfTriangle(x0, y0, x2, y2, x1, y1);
        var alpha, beta, gamma;
        var vNormal = { x: 0, y: 0, z: 0 };
        for (l = Math.ceil(Math.min(x0, x1, x2)) ; l < Math.ceil(Math.max(x0, x1, x2)) ; l++) {
            c = 0;
            for (q = Math.ceil(Math.min(y0, y1, y2)) ; q < Math.ceil(Math.max(y0, y1, y2)) ; q++) {
                var eq = new Array(3);
                var eqNew = new Array(3);
                //edge (x0 to x1)
                dY = y1 - y0;
                dX = x1 - x0;
                eq[0] = (dY * (l - x1)) - (dX * (q - y1));
                eqNew[0] = (dY * (x2 - x1)) - (dX * (y2 - y1));
                //edge (x1 to x2)
                dY = y2 - y1;
                dX = x2 - x1;
                eq[1] = (dY * (l - x2)) - (dX * (q - y2));
                eqNew[1] = (dY * (x0 - x2)) - (dX * (y0 - y2));
                //edge (x2 to x0)
                dY = y0 - y2;
                dX = x0 - x2;
                eq[2] = (dY * (l - x0)) - (dX * (q - y0));
                eqNew[2] = (dY * (x1 - x0)) - (dX * (y1 - y0));
                if ((eq[0] * eqNew[0] >= 0 && eq[1] * eqNew[1] >= 0 && eq[2] * eqNew[2] >= 0)) {
                    if (c == 0) {
                        ya = q;
                        yb = q;
                        c++
                    }
                    else if (q > yb) {
                        yb = q;
                    }
                }
            }
            for (k = ya; k <= yb; k++) {
                var eq = new Array(3);
                var eqNew = new Array(3);
                //edge (x0 to x1)
                dY = y1 - y0;
                dX = x1 - x0;
                eq[0] = (dY * (l - x1)) - (dX * (k - y1));
                eqNew[0] = (dY * (x2 - x1)) - (dX * (y2 - y1));
                //edge (x1 to x2)
                dY = y2 - y1;
                dX = x2 - x1;
                eq[1] = (dY * (l - x2)) - (dX * (k - y2));
                eqNew[1] = (dY * (x0 - x2)) - (dX * (y0 - y2));
                //edge (x2 to x0)
                dY = y0 - y2;
                dX = x0 - x2;
                eq[2] = (dY * (l - x0)) - (dX * (k - y0));
                eqNew[2] = (dY * (x1 - x0)) - (dX * (y1 - y0));
                if ((eq[0] * eqNew[0] >= 0 && eq[1] * eqNew[1] >= 0 && eq[2] * eqNew[2] >= 0)) {

                    z = (D - (A * l) - (B * k)) / C;
                    var h = (l + k * finalimageData.width);
                    if (z < zbuffer[index][h]) {
                        zbuffer[index][h] = z;
                        //calculating new l from ya and yb
                        var eqlya = new Array(3);
                        var eqlyb = new Array(3);
                        dY = y1 - y0;
                        dX = (x1) - (x0);
                        eqlya[0] = ((dX * (ya - y1)) / dY) + x1;
                        dY = (y2) - (y1);
                        dX = (x2) - (x1);
                        eqlya[1] = ((dX * (ya - y2)) / dY) + x2;
                        dY = (y0) - (y2);
                        dX = (x0) - (x2);
                        eqlya[2] = ((dX * (ya - y0)) / dY) + x0;

                        dY = y1 - y0;
                        dX = (x1) - (x0);
                        eqlyb[0] = ((dX * (yb - y1)) / dY) + x1;
                        dY = (y2) - (y1);
                        dX = (x2) - (x1);
                        eqlyb[1] = ((dX * (yb - y2)) / dY) + x2;
                        dY = (y0) - (y2);
                        dX = (x0) - (x2);
                        eqlyb[2] = ((dX * (yb - y0)) / dY) + x0;
                        //calculating y from l
                        var eqly1 = new Array(3);
                        dY = y1 - y0;
                        dX = (x1) - (x0);
                        eqly1[0] = ((dY * (l - x1)) / dX) + y1;
                        dY = (y2) - (y1);
                        dX = (x2) - (x1);
                        eqly1[1] = ((dY * (l - x2)) / dX) + y2;
                        dY = (y0) - (y2);
                        dX = (x0) - (x2);
                        eqly1[2] = ((dY * (l - x0)) / dX) + y0;

                        //Normal at ya
                        if (Math.min(Math.abs(eqlya[0] - l), Math.abs(eqlya[1] - l), Math.abs(eqlya[2] - l)) == Math.abs((eqlya[0]) - l)) {
                            if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[0]) - ya)) {

                                Nax = (((x1 - l) / (x1 - x0)) * normalx0y0.x) + (((l - x0) / (x1 - x0)) * normalx1y1.x);
                                Nay = (((x1 - l) / (x1 - x0)) * normalx0y0.y) + (((l - x0) / (x1 - x0)) * normalx1y1.y);
                                Naz = (((x1 - l) / (x1 - x0)) * normalx0y0.z) + (((l - x0) / (x1 - x0)) * normalx1y1.z);
                            }

                            else if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[1]) - ya)) {
                                Nax = (((x1 - l) / (x1 - x2)) * normalx2y2.x) + (((l - x2) / (x1 - x2)) * normalx1y1.x);
                                Nay = (((x1 - l) / (x1 - x2)) * normalx2y2.y) + (((l - x2) / (x1 - x2)) * normalx1y1.y);
                                Naz = (((x1 - l) / (x1 - x2)) * normalx2y2.z) + (((l - x2) / (x1 - x2)) * normalx1y1.z);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[2]) - ya)) {
                                Nax = (((x2 - l) / (x2 - x0)) * normalx0y0.x) + (((l - x0) / (x2 - x0)) * normalx2y2.x);
                                Nay = (((x2 - l) / (x2 - x0)) * normalx0y0.y) + (((l - x0) / (x2 - x0)) * normalx2y2.y);
                                Naz = (((x2 - l) / (x2 - x0)) * normalx0y0.z) + (((l - x0) / (x2 - x0)) * normalx2y2.z);
                            }
                        }
                        if (Math.min(Math.abs(eqlya[0] - l), Math.abs(eqlya[1] - l), Math.abs(eqlya[2] - l)) == Math.abs((eqlya[1]) - l)) {
                            if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[0]) - ya)) {

                                Nax = (((x1 - l) / (x1 - x0)) * normalx0y0.x) + (((l - x0) / (x1 - x0)) * normalx1y1.x);
                                Nay = (((x1 - l) / (x1 - x0)) * normalx0y0.y) + (((l - x0) / (x1 - x0)) * normalx1y1.y);
                                Naz = (((x1 - l) / (x1 - x0)) * normalx0y0.z) + (((l - x0) / (x1 - x0)) * normalx1y1.z);
                            }

                            else if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[1]) - ya)) {
                                Nax = (((x1 - l) / (x1 - x2)) * normalx2y2.x) + (((l - x2) / (x1 - x2)) * normalx1y1.x);
                                Nay = (((x1 - l) / (x1 - x2)) * normalx2y2.y) + (((l - x2) / (x1 - x2)) * normalx1y1.y);
                                Naz = (((x1 - l) / (x1 - x2)) * normalx2y2.z) + (((l - x2) / (x1 - x2)) * normalx1y1.z);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[2]) - ya)) {
                                Nax = (((x2 - l) / (x2 - x0)) * normalx0y0.x) + (((l - x0) / (x2 - x0)) * normalx2y2.x);
                                Nay = (((x2 - l) / (x2 - x0)) * normalx0y0.y) + (((l - x0) / (x2 - x0)) * normalx2y2.y);
                                Naz = (((x2 - l) / (x2 - x0)) * normalx0y0.z) + (((l - x0) / (x2 - x0)) * normalx2y2.z);
                            }
                        }
                        if (Math.min(Math.abs(eqlya[0] - l), Math.abs(eqlya[1] - l), Math.abs(eqlya[2] - l)) == Math.abs((eqlya[2]) - l)) {
                            if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[0]) - ya)) {

                                Nax = (((x1 - l) / (x1 - x0)) * normalx0y0.x) + (((l - x0) / (x1 - x0)) * normalx1y1.x);
                                Nay = (((x1 - l) / (x1 - x0)) * normalx0y0.y) + (((l - x0) / (x1 - x0)) * normalx1y1.y);
                                Naz = (((x1 - l) / (x1 - x0)) * normalx0y0.z) + (((l - x0) / (x1 - x0)) * normalx1y1.z);
                            }

                            else if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[1]) - ya)) {
                                Nax = (((x1 - l) / (x1 - x2)) * normalx2y2.x) + (((l - x2) / (x1 - x2)) * normalx1y1.x);
                                Nay = (((x1 - l) / (x1 - x2)) * normalx2y2.y) + (((l - x2) / (x1 - x2)) * normalx1y1.y);
                                Naz = (((x1 - l) / (x1 - x2)) * normalx2y2.z) + (((l - x2) / (x1 - x2)) * normalx1y1.z);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - ya), Math.abs(eqly1[1] - ya), Math.abs(eqly1[2] - ya)) == Math.abs((eqly1[2]) - ya)) {
                                Nax = (((x2 - l) / (x2 - x0)) * normalx0y0.x) + (((l - x0) / (x2 - x0)) * normalx2y2.x);
                                Nay = (((x2 - l) / (x2 - x0)) * normalx0y0.y) + (((l - x0) / (x2 - x0)) * normalx2y2.y);
                                Naz = (((x2 - l) / (x2 - x0)) * normalx0y0.z) + (((l - x0) / (x2 - x0)) * normalx2y2.z);
                            }
                        }
                        //yb
                        if (Math.min(Math.abs(eqlyb[0] - l), Math.abs(eqlyb[1] - l), Math.abs(eqlyb[2] - l)) == Math.abs((eqlyb[0]) - l)) {
                            if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[0]) - yb)) {

                                Nbx = (((x1 - l) / (x1 - x0)) * normalx0y0.x) + (((l - x0) / (x1 - x0)) * normalx1y1.x);
                                Nby = (((x1 - l) / (x1 - x0)) * normalx0y0.y) + (((l - x0) / (x1 - x0)) * normalx1y1.y);
                                Nbz = (((x1 - l) / (x1 - x0)) * normalx0y0.z) + (((l - x0) / (x1 - x0)) * normalx1y1.z);
                            }

                            else if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[1]) - yb)) {
                                Nbx = (((x1 - l) / (x1 - x2)) * normalx2y2.x) + (((l - x2) / (x1 - x2)) * normalx1y1.x);
                                Nby = (((x1 - l) / (x1 - x2)) * normalx2y2.y) + (((l - x2) / (x1 - x2)) * normalx1y1.y);
                                Nbz = (((x1 - l) / (x1 - x2)) * normalx2y2.z) + (((l - x2) / (x1 - x2)) * normalx1y1.z);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[2]) - yb)) {
                                Nbx = (((x2 - l) / (x2 - x0)) * normalx0y0.x) + (((l - x0) / (x2 - x0)) * normalx2y2.x);
                                Nby = (((x2 - l) / (x2 - x0)) * normalx0y0.y) + (((l - x0) / (x2 - x0)) * normalx2y2.y);
                                Nbz = (((x2 - l) / (x2 - x0)) * normalx0y0.z) + (((l - x0) / (x2 - x0)) * normalx2y2.z);
                            }
                        }
                        if (Math.min(Math.abs(eqlyb[0] - l), Math.abs(eqlyb[1] - l), Math.abs(eqlyb[2] - l)) == Math.abs((eqlyb[1]) - l)) {
                            if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[0]) - yb)) {

                                Nbx = (((x1 - l) / (x1 - x0)) * normalx0y0.x) + (((l - x0) / (x1 - x0)) * normalx1y1.x);
                                Nby = (((x1 - l) / (x1 - x0)) * normalx0y0.y) + (((l - x0) / (x1 - x0)) * normalx1y1.y);
                                Nbz = (((x1 - l) / (x1 - x0)) * normalx0y0.z) + (((l - x0) / (x1 - x0)) * normalx1y1.z);
                            }

                            else if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[1]) - yb)) {
                                Nbx = (((x1 - l) / (x1 - x2)) * normalx2y2.x) + (((l - x2) / (x1 - x2)) * normalx1y1.x);
                                Nby = (((x1 - l) / (x1 - x2)) * normalx2y2.y) + (((l - x2) / (x1 - x2)) * normalx1y1.y);
                                Nbz = (((x1 - l) / (x1 - x2)) * normalx2y2.z) + (((l - x2) / (x1 - x2)) * normalx1y1.z);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[2]) - yb)) {
                                Nbx = (((x2 - l) / (x2 - x0)) * normalx0y0.x) + (((l - x0) / (x2 - x0)) * normalx2y2.x);
                                Nby = (((x2 - l) / (x2 - x0)) * normalx0y0.y) + (((l - x0) / (x2 - x0)) * normalx2y2.y);
                                Nbz = (((x2 - l) / (x2 - x0)) * normalx0y0.z) + (((l - x0) / (x2 - x0)) * normalx2y2.z);
                            }
                        }
                        if (Math.min(Math.abs(eqlyb[0] - l), Math.abs(eqlyb[1] - l), Math.abs(eqlyb[2] - l)) == Math.abs((eqlyb[2]) - l)) {
                            if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[0]) - yb)) {

                                Nbx = (((x1 - l) / (x1 - x0)) * normalx0y0.x) + (((l - x0) / (x1 - x0)) * normalx1y1.x);
                                Nby = (((x1 - l) / (x1 - x0)) * normalx0y0.y) + (((l - x0) / (x1 - x0)) * normalx1y1.y);
                                Nbz = (((x1 - l) / (x1 - x0)) * normalx0y0.z) + (((l - x0) / (x1 - x0)) * normalx1y1.z);
                            }

                            else if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[1]) - yb)) {
                                Nbx = (((x1 - l) / (x1 - x2)) * normalx2y2.x) + (((l - x2) / (x1 - x2)) * normalx1y1.x);
                                Nby = (((x1 - l) / (x1 - x2)) * normalx2y2.y) + (((l - x2) / (x1 - x2)) * normalx1y1.y);
                                Nbz = (((x1 - l) / (x1 - x2)) * normalx2y2.z) + (((l - x2) / (x1 - x2)) * normalx1y1.z);
                            }
                            else if (Math.min(Math.abs(eqly1[0] - yb), Math.abs(eqly1[1] - yb), Math.abs(eqly1[2] - yb)) == Math.abs((eqly1[2]) - yb)) {
                                Nbx = (((x2 - l) / (x2 - x0)) * normalx0y0.x) + (((l - x0) / (x2 - x0)) * normalx2y2.x);
                                Nby = (((x2 - l) / (x2 - x0)) * normalx0y0.y) + (((l - x0) / (x2 - x0)) * normalx2y2.y);
                                Nbz = (((x2 - l) / (x2 - x0)) * normalx0y0.z) + (((l - x0) / (x2 - x0)) * normalx2y2.z);
                            }
                        }

                        if (l < 0)
                            l = 0.0;
                        if (k < 0)
                            k = 0.0;


                        if (l > 256)
                            l = 256.0;
                        if (k > 256)
                            k = 256.0;

                        var Kt = { r: 1, g: 1, b: 1 };

                        var vz = z / (zmax - z);

                        if (k == ya) {

                            vNormal.x = Nax; vNormal.y = Nay; vNormal.z = Naz;
                            Ca = ComputeTriangleColor(vNormal);

                            if (textureMode != 0) {
                                gamma = areaOfTriangle(x0, y0, l, k, x2, y2) / Area;
                                beta = areaOfTriangle(x0, y0, l, k, x1, y1) / Area;
                                alpha = 1 - gamma - beta;
                                Tas = (alpha * sv0) + (beta * sv2) + (gamma * sv1);
                                Tat = (alpha * tv0) + (beta * tv2) + (gamma * tv1);

                                Tas *= (vz + 1);
                                Tat *= (vz + 1);
                                if (textureMode == 1) {
                                    Kt = texture(Tas, Tat);
                                } else { Kt = proceduraltexture(Tas, Tat); }
                                setPixel(imageData[index], l, k, (RGB_COLOR * (Kt.r * Ca.r + specularCoefficient.r * specularSum1[0])), (RGB_COLOR * (Kt.g * Ca.g + specularCoefficient.r * specularSum1[1])), (RGB_COLOR * (Kt.b * Ca.b + specularCoefficient.r * specularSum1[2])), 255);
                            } else {
                                setPixel(imageData[index], l, k, (RGB_COLOR * Ca.r), (RGB_COLOR * Ca.g), (RGB_COLOR * Ca.b), 255);
                            }
                        }
                        else if (k == yb) {

                            vNormal.x = Nbx; vNormal.y = Nby; vNormal.z = Nbz;
                            Cb = ComputeTriangleColor(vNormal);

                            if (textureMode != 0) {
                                gamma = areaOfTriangle(x0, y0, l, k, x2, y2) / Area;
                                beta = areaOfTriangle(x0, y0, l, k, x1, y1) / Area;
                                alpha = 1 - gamma - beta;
                                Tbs = (alpha * sv0) + (beta * sv2) + (gamma * sv1);
                                Tbt = (alpha * tv0) + (beta * tv2) + (gamma * tv1);

                                Tbs *= (vz + 1);
                                Tbt *= (vz + 1);
                                if (textureMode == 1) {
                                    Kt = texture(Tbs, Tbt);
                                } else { Kt = proceduraltexture(Tbs, Tbt); }
                                setPixel(imageData[index], l, k, (RGB_COLOR * (Kt.r * Cb.r + specularCoefficient.r * specularSum1[0])), (RGB_COLOR * (Kt.g * Cb.g + specularCoefficient.r * specularSum1[1])), (RGB_COLOR * (Kt.b * Cb.b + specularCoefficient.r * specularSum1[2])), 255);
                            }
                            else {
                                setPixel(imageData[index], l, k, (RGB_COLOR * Cb.r), (RGB_COLOR * Cb.g), (RGB_COLOR * Cb.b), 255);
                            }
                        }
                        else if (k != ya && k != yb) {
                            Npx = (((yb - k) / (yb - ya)) * Nax) + (((k - ya) / (yb - ya)) * Nbx);
                            Npy = (((yb - k) / (yb - ya)) * Nay) + (((k - ya) / (yb - ya)) * Nby);
                            Npz = (((yb - k) / (yb - ya)) * Naz) + (((k - ya) / (yb - ya)) * Nbz);
                            vNormal.x = Npx; vNormal.y = Npy; vNormal.z = Npz;
                            Cp = ComputeTriangleColor(vNormal);

                            if (textureMode != 0) {
                                gamma = areaOfTriangle(x0, y0, l, k, x2, y2) / Area;
                                beta = areaOfTriangle(x0, y0, l, k, x1, y1) / Area;
                                alpha = 1 - gamma - beta;
                                Tps = (alpha * sv0) + (beta * sv2) + (gamma * sv1);
                                Tpt = (alpha * tv0) + (beta * tv2) + (gamma * tv1);

                                Tps *= (vz + 1);
                                Tpt *= (vz + 1);
                                if (textureMode == 1) {
                                    Kt = texture(Tps, Tpt);
                                } else { Kt = proceduraltexture(Tps, Tpt); }
                                setPixel(imageData[index], l, k, (RGB_COLOR * (Kt.r * Cp.r + specularCoefficient.r * specularSum1[0])), (RGB_COLOR * (Kt.g * Cp.g + specularCoefficient.r * specularSum1[1])), (RGB_COLOR * (Kt.b * Cp.b + specularCoefficient.r * specularSum1[2])), 255);
                            } else {
                                setPixel(imageData[index], l, k, (RGB_COLOR * Cp.r), (RGB_COLOR * Cp.g), (RGB_COLOR * Cp.b), 255);
                            }
                        }
                    }
                }
            }

        }
    }
}

//Push Matrix
function multiplyMatrix(inputM, M) {
    var temp = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    temp[0][0] = inputM[0][0] * M[0][0] + inputM[0][1] * M[1][0] + inputM[0][2] * M[2][0] + inputM[0][3] * M[3][0];
    temp[0][1] = inputM[0][0] * M[0][1] + inputM[0][1] * M[1][1] + inputM[0][2] * M[2][1] + inputM[0][3] * M[3][1];
    temp[0][2] = inputM[0][0] * M[0][2] + inputM[0][1] * M[1][2] + inputM[0][2] * M[2][2] + inputM[0][3] * M[3][2];
    temp[0][3] = inputM[0][0] * M[0][3] + inputM[0][1] * M[1][3] + inputM[0][2] * M[2][3] + inputM[0][3] * M[3][3];

    temp[1][0] = inputM[1][0] * M[0][0] + inputM[1][1] * M[1][0] + inputM[1][2] * M[2][0] + inputM[1][3] * M[3][0];
    temp[1][1] = inputM[1][0] * M[0][1] + inputM[1][1] * M[1][1] + inputM[1][2] * M[2][1] + inputM[1][3] * M[3][1];
    temp[1][2] = inputM[1][0] * M[0][2] + inputM[1][1] * M[1][2] + inputM[1][2] * M[2][2] + inputM[1][3] * M[3][2];
    temp[1][3] = inputM[1][0] * M[0][3] + inputM[1][1] * M[1][3] + inputM[1][2] * M[2][3] + inputM[1][3] * M[3][3];

    temp[2][0] = inputM[2][0] * M[0][0] + inputM[2][1] * M[1][0] + inputM[2][2] * M[2][0] + inputM[2][3] * M[3][0];
    temp[2][1] = inputM[2][0] * M[0][1] + inputM[2][1] * M[1][1] + inputM[2][2] * M[2][1] + inputM[2][3] * M[3][1];
    temp[2][2] = inputM[2][0] * M[0][2] + inputM[2][1] * M[1][2] + inputM[2][2] * M[2][2] + inputM[2][3] * M[3][2];
    temp[2][3] = inputM[2][0] * M[0][3] + inputM[2][1] * M[1][3] + inputM[2][2] * M[2][3] + inputM[2][3] * M[3][3];

    temp[3][0] = inputM[3][0] * M[0][0] + inputM[3][1] * M[1][0] + inputM[3][2] * M[2][0] + inputM[3][3] * M[3][0];
    temp[3][1] = inputM[3][0] * M[0][1] + inputM[3][1] * M[1][1] + inputM[3][2] * M[2][1] + inputM[3][3] * M[3][1];
    temp[3][2] = inputM[3][0] * M[0][2] + inputM[3][1] * M[1][2] + inputM[3][2] * M[2][2] + inputM[3][3] * M[3][2];
    temp[3][3] = inputM[3][0] * M[0][3] + inputM[3][1] * M[1][3] + inputM[3][2] * M[2][3] + inputM[3][3] * M[3][3];

    return temp;
}
function rotateX(u) {
    //convert to radians
    u = u * (0.0174);
    var M = [[1, 0, 0, 0], [0, Math.cos(u), -Math.sin(u), 0], [0, Math.sin(u), Math.cos(u), 0], [0, 0, 0, 1]];
    var resultant = multiplyMatrix(cpt, M);
    cpt = resultant;
    //normal rotation matrix
    if (interpolate == 0 || interpolate == 1 || interpolate == 2) {
        var resultant = multiplyMatrix(cptNorm, M);
        cptNorm = calculateK(resultant);
    }
}

function rotateY(u) {
    //convert to radians
    u = u * (0.0174);
    var M = [[Math.cos(u), 0, Math.sin(u), 0], [0, 1, 0, 0], [-Math.sin(u), 0, Math.cos(u), 0], [0, 0, 0, 1]];
    var resultant = multiplyMatrix(cpt, M);
    cpt = resultant;
    //normal rotation matrix
    if (interpolate == 0 || interpolate == 1 || interpolate == 2) {
        var resultant = multiplyMatrix(cptNorm, M);
        cptNorm = calculateK(resultant);
    }
}
function rotateZ(u) {
    //convert to radians
    u = u * (0.0174);
    var M = [[Math.cos(u), -Math.sin(u), 0, 0], [Math.sin(u), Math.cos(u), 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    var resultant = multiplyMatrix(cpt, M);
    cpt = resultant;
    //normal rotation matrix
    if (interpolate == 0 || interpolate == 1 || interpolate == 2) {
        var resultant = multiplyMatrix(cptNorm, M);
        cptNorm = calculateK(resultant);
    }
}
function rotateXtranspose(u) {
    //convert to radians
    u = u * (0.0174);
    var M = [[1, 0, 0, 0], [0, Math.cos(u), Math.sin(u), 0], [0, -Math.sin(u), Math.cos(u), 0], [0, 0, 0, 1]];
    var resultant = multiplyMatrix(cpt, M);
    cpt = resultant;
    //normal rotation matrix
    if (interpolate == 0 || interpolate == 1 || interpolate == 2) {
        var resultant = multiplyMatrix(cptNorm, M);
        cptNorm = calculateK(resultant);
    }
}

function rotateYtranspose(u) {
    //convert to radians
    u = u * (0.0174);
    var M = [[Math.cos(u), 0, -Math.sin(u), 0], [0, 1, 0, 0], [Math.sin(u), 0, Math.cos(u), 0], [0, 0, 0, 1]];
    var resultant = multiplyMatrix(cpt, M);
    cpt = resultant;
    //normal rotation matrix
    if (interpolate == 0 || interpolate == 1 || interpolate == 2) {
        var resultant = multiplyMatrix(cptNorm, M);
        cptNorm = calculateK(resultant);
    }
}
function rotateZtranspose(u) {
    //convert to radians
    u = u * (0.0174);
    var M = [[Math.cos(u), Math.sin(u), 0, 0], [-Math.sin(u), Math.cos(u), 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    var resultant = multiplyMatrix(cpt, M);
    cpt = resultant;
    //normal rotation matrix
    if (interpolate == 0 || interpolate == 1 || interpolate == 2) {
        var resultant = multiplyMatrix(cptNorm, M);
        cptNorm = calculateK(resultant);
    }
}

function translate(u, v, w) {
    var M = [[1, 0, 0, u], [0, 1, 0, v], [0, 0, 1, w], [0, 0, 0, 1]];
    var resultant = multiplyMatrix(cpt, M);
    cpt = resultant;
}
function scale(u, v, w) {
    var M = [[u, 0, 0, 0], [0, v, 0, 0], [0, 0, w, 0], [0, 0, 0, 1]];
    var resultant = multiplyMatrix(cpt, M);
    cpt = resultant;
}

function camera(look, up, position) {
    //lookXup
    //cl vector
    var plx = look.x - position.x;
    var ply = look.y - position.y;
    var plz = look.z - position.z;
    var plLength = Math.sqrt(plx * plx + ply * ply + plz * plz);

    var Z = { x: 0, y: 0, z: 0, w: 0 };
    Z.x = plx / plLength;
    Z.y = ply / plLength;
    Z.z = plz / plLength;

    var updotZ = up.x * Z.x + up.y * Z.y + up.z * Z.z;
    var upx = up.x - (updotZ) * Z.x;
    var upy = up.y - (updotZ) * Z.y;
    var upz = up.z - (updotZ) * Z.z;
    var upLength = Math.sqrt(upx * upx + upy * upy + upz * upz);

    var Y = { x: 0, y: 0, z: 0, w: 0 };
    Y.x = upx / upLength;
    Y.y = upy / upLength;
    Y.z = upz / upLength;

    var sx = (Y.y * Z.z) - (Y.z * Z.y);
    var sy = (Y.z * Z.x) - (Y.x * Z.z);
    var sz = (Y.x * Z.y) - (Y.y * Z.x);

    var rup = ((position.x * Y.x) + (position.y * Y.y) + (position.z * Y.z));
    var rlook = ((position.x * Z.x) + (position.y * Z.y) + (position.z * Z.z));
    var rside = ((position.x * sx) + (position.y * sy) + (position.z * sz));

    var M = [[sx, sy, sz, -rside], [Y.x, Y.y, Y.z, -rup], [Z.x, Z.y, Z.z, -rlook], [0, 0, 0, 1]];
    var resultant = multiplyMatrix(cpt, M);
    cpt = resultant;
    if (interpolate == 0 || interpolate == 1 || interpolate == 2) {
        var resultant = multiplyMatrix(cptNorm, M);
        cptNorm = calculateK(resultant);
    }
}

function perspectivep(fov) {
    fov = fov * (0.0174);
    oneByd = Math.tan((fov / 2));
    var M = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, oneByd, 1]];
    var resultant = multiplyMatrix(cpt, M);
    cpt = resultant;
}
function toScreen(xs, ys, fov) {
    fov = fov * (0.0174);
    var zmax = 2147483647;
    var d = 1 / Math.tan((fov / 2));
    var M = [[xs / 2, 0, 0, xs / 2], [0, -(ys / 2), 0, ys / 2], [0, 0, (zmax / d), 0], [0, 0, 0, 1]];
    var resultant = multiplyMatrix(cpt, M);
    cpt = resultant;
}
//if homogeneous coordinate
function normalize(vector) {
    vector[0] = vector[0] / vector[3];
    vector[1] = vector[1] / vector[3];
    vector[2] = vector[2] / vector[3];
    return vector;
}
function calculateK(M) {
    var k = 1 / Math.sqrt(M[0][0] * M[0][0] + M[1][0] * M[1][0] + M[2][0] * M[2][0]);
    M[0][0] *= k; M[0][1] *= k; M[0][2] *= k; M[0][3] = 0;
    M[1][0] *= k; M[1][1] *= k; M[1][2] *= k; M[1][3] = 0;
    M[2][0] *= k; M[2][1] *= k; M[2][2] *= k; M[2][3] = 0;
    M[3][0] *= k; M[3][1] *= k; M[3][2] *= k; M[3][3] = 1;
    return M;

}
var c = document.getElementById("canvas");
width = parseInt(c.getAttribute("width"));
height = parseInt(c.getAttribute("height"));
var zbuffer = new Array(6);
var tri = [[0, 0, 0],
    [0, 0, 0],
[0, 0, 0]];
//all the matrices gets multipits into one matrix
var cpt = [[1, 0, 0, 0],
    [0, 1, 0, 0],
[0, 0, 1, 0],
[0, 0, 0, 1]];
var cptNorm = [[1, 0, 0, 0],
    [0, 1, 0, 0],
[0, 0, 1, 0],
[0, 0, 0, 1]];
var index;
var output = ["P3<br>256 256<br>255<br>"];
var ctx = NewDisplay(c);
//array of size 6
var finalimageData = NewFrameBuffer(ctx, width, height);
var imageData = new Array(6);
for (var i = 0; i < 6; i++)
{
    imageData[i] = new Array(width * height * 4);
    zbuffer[i] = new Array(width * height);
}
InitDisplay(ctx, finalimageData);
var x0 = 0;
var y0 = 0;
var y1 = 0;
var x1 = 0;
var y2 = 0;
var x2 = 0;
var dxba, dyba, dzba, dxca, dyca, dzca, A, B, C, D, z;
var color = { r: 0, g: 0, b: 0 };
var RGB_COLOR = 255;
var position = { x: -3, y: -25, z: -4, w: 1.0 };
var look = { x: 7.8, y: 0.7, z: 6.5, w: 0.0 };
var up = { x: -0.2, y: 1.0, z: 0.0, w: 0.0 };
var fov = 63.7;
var angle = fov;
var tx = 0.0, ty = -3.25, tz = 3.5;
var scalex = 3.25; scaley = 3.25; scalez = 3.25;
var newtx = 0.0, newty = -3.25, newtz = 3.5;
var rangleX = -45.0;
var rangleY = -30.0;
var anirangleX = rangleX;
var anirangleY = rangleY;
var flag = 0;
var textureMode = 0;
var zmax = 2147483647;
var shiftx = [-0.52,0.41,0.27,-0.17,0.58,-0.38], shifty = [0.38,0.56,0.08,-0.29,-0.55,-0.71], weight = [0.128,0.119,0.294,0.249,0.104,0.106];

var ambientlight = { direction: { x: 0, y: 0, z: 0 }, color: { r: 0.3, g: 0.3, b: 0.3 } };

var light = [{ direction: { x: -0.7071, y: 0.7071, z: 0 }, color: { r: 0.5, g: 0.5, b: 0.9 } },
    { direction: { x: 0, y: -0.7071, z: -0.7071 }, color: { r: 0.9, g: 0.2, b: 0.3 } },
{ direction: { x: 0.7071, y: 0.0, z: -0.7071 }, color: { r: 0.2, g: 0.7, b: 0.3 } }];

var normalV1 = { x: 0, y: 0, z: 0 };
var normalV2 = { x: 0, y: 0, z: 0 };
var normalV3 = { x: 0, y: 0, z: 0 };

var normalx0y0 = { x: 0, y: 0, z: 0 };
var normalx1y1 = { x: 0, y: 0, z: 0 };
var normalx2y2 = { x: 0, y: 0, z: 0 };

/* Material property */
var specularCoefficient = { r: 0.3, g: 0.3, b: 0.3 };
var ambientCoefficient = { r: 0.1, g: 0.1, b: 0.1 };
var diffuseCoefficient = { r: 0.7, g: 0.7, b: 0.7 };

var x0y0color;
var x1y1color;
var x2y2color;

//texture
var s3, t3, s1, t1, s2, t2;
var sv0, tv0, sv1, tv1, sv2, tv2;

var interpolate = 0;

if (InitializeStates()) {

    toScreen(width, height, fov);
    perspectivep(fov);
    camera(look, up, position);
    translate(tx, ty, tz);
    scale(scalex, scaley, scalez);
    rotateY(rangleY);
    rotateX(rangleX);

    //takes triangle data from json
    DrawTriangle(Triangles);

}
function DrawTriangle(triangles) {

    for (var i = 0; i < triangles.length; i++) {
        tri[0][0] = triangles[i].V1.X;
        tri[0][1] = (triangles[i].V1.Y);
        tri[0][2] = (triangles[i].V1.Z);
        normalV1.x = triangles[i].V1.normal.x;
        normalV1.y = triangles[i].V1.normal.y;
        normalV1.z = triangles[i].V1.normal.z;
        s1 = triangles[i].V1.s;
        t1 = triangles[i].V1.t;
        tri[1][0] = (triangles[i].V2.X);
        tri[1][1] = (triangles[i].V2.Y);
        tri[1][2] = (triangles[i].V2.Z);
        normalV2.x = triangles[i].V2.normal.x;
        normalV2.y = triangles[i].V2.normal.y;
        normalV2.z = triangles[i].V2.normal.z;
        s2 = triangles[i].V2.s;
        t2 = triangles[i].V2.t;
        tri[2][0] = (triangles[i].V3.X);
        tri[2][1] = (triangles[i].V3.Y);
        tri[2][2] = (triangles[i].V3.Z);
        normalV3.x = triangles[i].V3.normal.x;
        normalV3.y = triangles[i].V3.normal.y;
        normalV3.z = triangles[i].V3.normal.z;
        s3 = triangles[i].V3.s;
        t3 = triangles[i].V3.t;

        var temp = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]; // for 3 verticies
        var vector = [0, 0, 0, 0];

        temp[0][0] = tri[0][0] * cpt[0][0] + tri[0][1] * cpt[0][1] + tri[0][2] * cpt[0][2] + 1 * cpt[0][3];//v0 x
        temp[0][1] = tri[0][0] * cpt[1][0] + tri[0][1] * cpt[1][1] + tri[0][2] * cpt[1][2] + 1 * cpt[1][3]; //v0 y
        temp[0][2] = tri[0][0] * cpt[2][0] + tri[0][1] * cpt[2][1] + tri[0][2] * cpt[2][2] + 1 * cpt[2][3]; //v0 z
        temp[0][3] = tri[0][0] * cpt[3][0] + tri[0][1] * cpt[3][1] + tri[0][2] * cpt[3][2] + 1 * cpt[3][3];
        vector = normalize(temp[0]);

        temp[0][0] = vector[0];
        temp[0][1] = vector[1];
        temp[0][2] = vector[2];
        temp[0][3] = vector[3];

        temp[1][0] = tri[1][0] * cpt[0][0] + tri[1][1] * cpt[0][1] + tri[1][2] * cpt[0][2] + 1 * cpt[0][3];//v1 x
        temp[1][1] = tri[1][0] * cpt[1][0] + tri[1][1] * cpt[1][1] + tri[1][2] * cpt[1][2] + 1 * cpt[1][3]; //v1 y
        temp[1][2] = tri[1][0] * cpt[2][0] + tri[1][1] * cpt[2][1] + tri[1][2] * cpt[2][2] + 1 * cpt[2][3]; //v1 z
        temp[1][3] = tri[1][0] * cpt[3][0] + tri[1][1] * cpt[3][1] + tri[1][2] * cpt[3][2] + 1 * cpt[3][3];
        vector = normalize(temp[1]);

        temp[1][0] = vector[0];
        temp[1][1] = vector[1];
        temp[1][2] = vector[2];
        temp[1][3] = vector[3];

        temp[2][0] = tri[2][0] * cpt[0][0] + tri[2][1] * cpt[0][1] + tri[2][2] * cpt[0][2] + 1 * cpt[0][3];//v2 x
        temp[2][1] = tri[2][0] * cpt[1][0] + tri[2][1] * cpt[1][1] + tri[2][2] * cpt[1][2] + 1 * cpt[1][3]; //v2 y
        temp[2][2] = tri[2][0] * cpt[2][0] + tri[2][1] * cpt[2][1] + tri[2][2] * cpt[2][2] + 1 * cpt[2][3]; //v2 z
        temp[2][3] = tri[2][0] * cpt[3][0] + tri[2][1] * cpt[3][1] + tri[2][2] * cpt[3][2] + 1 * cpt[3][3];
        vector = normalize(temp[2]);

        temp[2][0] = vector[0];
        temp[2][1] = vector[1];
        temp[2][2] = vector[2];
        temp[2][3] = vector[3];

        //transform normal
        var tempNorm = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]; // for 3 verticies
        var vectorNorm = [0, 0, 0, 0];

        tempNorm[0][0] = normalV1.x * cptNorm[0][0] + normalV1.y * cptNorm[0][1] + normalV1.z * cptNorm[0][2] + 1 * cptNorm[0][3];//v0 x normal
        tempNorm[0][1] = normalV1.x * cptNorm[1][0] + normalV1.y * cptNorm[1][1] + normalV1.z * cptNorm[1][2] + 1 * cptNorm[1][3]; //v0 y normal
        tempNorm[0][2] = normalV1.x * cptNorm[2][0] + normalV1.y * cptNorm[2][1] + normalV1.z * cptNorm[2][2] + 1 * cptNorm[2][3]; //v0 z normal
        tempNorm[0][3] = normalV1.x * cptNorm[3][0] + normalV1.y * cptNorm[3][1] + normalV1.z * cptNorm[3][2] + 1 * cptNorm[3][3];
        vectorNorm = normalize(tempNorm[0]);

        tempNorm[0][0] = vectorNorm[0];
        tempNorm[0][1] = vectorNorm[1];
        tempNorm[0][2] = vectorNorm[2];
        tempNorm[0][3] = vectorNorm[3];

        tempNorm[1][0] = normalV2.x * cptNorm[0][0] + normalV2.y * cptNorm[0][1] + normalV2.z * cptNorm[0][2] + 1 * cptNorm[0][3];//v1 x normal
        tempNorm[1][1] = normalV2.x * cptNorm[1][0] + normalV2.y * cptNorm[1][1] + normalV2.z * cptNorm[1][2] + 1 * cptNorm[1][3]; //v1 y normal
        tempNorm[1][2] = normalV2.x * cptNorm[2][0] + normalV2.y * cptNorm[2][1] + normalV2.z * cptNorm[2][2] + 1 * cptNorm[2][3]; //v1 z normal
        tempNorm[1][3] = normalV2.x * cptNorm[3][0] + normalV2.y * cptNorm[3][1] + normalV2.z * cptNorm[3][2] + 1 * cptNorm[3][3];
        vectorNorm = normalize(tempNorm[1]);

        tempNorm[1][0] = vectorNorm[0];
        tempNorm[1][1] = vectorNorm[1];
        tempNorm[1][2] = vectorNorm[2];
        tempNorm[1][3] = vectorNorm[3];

        tempNorm[2][0] = normalV3.x * cptNorm[0][0] + normalV3.y * cptNorm[0][1] + normalV3.z * cptNorm[0][2] + 1 * cptNorm[0][3];//v2 x normal
        tempNorm[2][1] = normalV3.x * cptNorm[1][0] + normalV3.y * cptNorm[1][1] + normalV3.z * cptNorm[1][2] + 1 * cptNorm[1][3]; //v2 y normal
        tempNorm[2][2] = normalV3.x * cptNorm[2][0] + normalV3.y * cptNorm[2][1] + normalV3.z * cptNorm[2][2] + 1 * cptNorm[2][3]; //v2 z normal
        tempNorm[2][3] = normalV3.x * cptNorm[3][0] + normalV3.y * cptNorm[3][1] + normalV3.z * cptNorm[3][2] + 1 * cptNorm[3][3];
        vectorNorm = normalize(tempNorm[2]);

        tempNorm[2][0] = vectorNorm[0];
        tempNorm[2][1] = vectorNorm[1];
        tempNorm[2][2] = vectorNorm[2];
        tempNorm[2][3] = vectorNorm[3];


        if (interpolate == 0) {
            normalV1.x = tempNorm[0][0];
            normalV1.y = tempNorm[0][1];
            normalV1.z = tempNorm[0][2];
            color = ComputeTriangleColor(normalV1);
            SetStateVariable(RGB_COLOR, color);
        }

        if (interpolate == 1 || interpolate == 2) {
            normalV1.x = tempNorm[0][0];
            normalV1.y = tempNorm[0][1];
            normalV1.z = tempNorm[0][2];
            normalV2.x = tempNorm[1][0];
            normalV2.y = tempNorm[1][1];
            normalV2.z = tempNorm[1][2];
            normalV3.x = tempNorm[2][0];
            normalV3.y = tempNorm[2][1];
            normalV3.z = tempNorm[2][2];

            color[0] = ComputeTriangleColor(normalV1);
            
            color[1] = ComputeTriangleColor(normalV2);
            
            color[2] = ComputeTriangleColor(normalV3);
        }
        render(temp);
    }

    Display(ctx);
}
function render(tri) {
    for (index = 0; index < 6; index++) {
        //shifting x and y values by dx and dy
        tri[0][0] += ((-1) * shiftx[index]);
        tri[1][0] += ((-1) * shiftx[index]);
        tri[2][0] += ((-1) * shiftx[index]);


        tri[0][1] += ((-1) * shifty[index]);
        tri[1][1] += ((-1) * shifty[index]);
        tri[2][1] += ((-1) * shifty[index]);

        //sort vertex on basis of max x value
        sortVertices(tri);
        // eq of tiangular plane abc plane for z bufer
        //b-a
        dxba = tri[1][0] - tri[0][0];
        dyba = tri[1][1] - tri[0][1];
        dzba = tri[1][2] - tri[0][2];
        //c-a
        dxca = tri[2][0] - tri[0][0];
        dyca = tri[2][1] - tri[0][1];
        dzca = tri[2][2] - tri[0][2];
        //b-a X c-a
        A = (dyba * dzca) - (dzba * dyca);
        B = (dzba * dxca) - (dxba * dzca);
        C = (dxba * dyca) - (dyba * dxca);
        //(b-a X c-a).Vertex[0]
        D = (A * tri[0][0]) + (B * tri[0][1]) + (C * tri[0][2]);
        var z0 = (D - (A * x0) - (B * y0)) / C;
        var z1 = (D - (A * x1) - (B * y1)) / C;
        var z2 = (D - (A * x2) - (B * y2)) / C;
        //perspective correction
        if (textureMode != 0) {
            var vz1 = z0 / (zmax - z0);
            sv0 = sv0 / (vz1 + 1);
            tv0 = tv0 / (vz1 + 1);

            var vz2 = z1 / (zmax - z1);
            sv1 = sv1 / (vz2 + 1);
            tv1 = tv1 / (vz2 + 1);

            var vz3 = z2 / (zmax - z2);
            sv2 = sv2 / (vz3 + 1);
            tv2 = tv2 / (vz3 + 1);
        }

        leeAlgo(x0, y0, x2, y2, x1, y1, index);
    }
}

function reset() {
    cpt = [[1, 0, 0, 0],
    [0, 1, 0, 0],
[0, 0, 1, 0],
[0, 0, 0, 1]];
    cptNorm = [[1, 0, 0, 0],
   [0, 1, 0, 0],
[0, 0, 1, 0],
[0, 0, 0, 1]];

}

function Translate_Click(x, y, z) {
    InitDisplay(ctx, finalimageData);
    tx = x; ty = y; tz = z;
    translate(tx, ty, tz);
    DrawTriangle(Triangles);
}
function Scale_Click(x, y, z) {
    InitDisplay(ctx, finalimageData);

    if (x < 0) {
        x = Math.abs(1 / x);
    }
    if (y < 0) {
        y = Math.abs(1 / y);
    }
    if (z < 0) {
        z = Math.abs(1 / z);
    }

    scalex = x; scaley = y; scalez = z;
    scale(scalex, scaley, scalez);
    DrawTriangle(Triangles);
}
function Rotation_Click(x, y, z) {

    InitDisplay(ctx, finalimageData);

    if (x > 0) {
        rotateXtranspose(-x);
    }
    if (y > 0) {
        rotateYtranspose(-y);
    }
    if (z > 0) {
        rotateZtranspose(-z);
    }
    if (x < 0) {
        rotateX(x);
    }
    if (y < 0) {
        rotateY(y);
    }
    if (z < 0) {
        rotateZ(z);
    }
    DrawTriangle(Triangles);
}
//pageFlip Animation
function nextFrameOnClick() {

    if (angle >= fov + 30) {
        alert("end of frames");
        angle = fov;
        anirangleX = rangleX;
        anirangleY = rangleY;
    }
    reset();
    InitDisplay(ctx, finalimageData);
    toScreen(width, height, angle);
    perspectivep(angle);
    camera(look, up, position);
    translate(0.0, -3.25, 3.5);
    scale(3.25, 3.25, 3.25);
    rotateY(anirangleY);
    rotateX(anirangleX);

    //takes triangle data from json
    DrawTriangle(Triangles);
    angle += 1.0;
    anirangleX += 1.0;
    anirangleY += 1.0;

}
function InterpolateStyle_Click(x) {
    finalimageData = NewFrameBuffer(ctx, width, height);
    InitDisplay(ctx, finalimageData);
    interpolate = x;
    textureMode = 0;

    reset();
    InitDisplay(ctx, finalimageData);
    toScreen(width, height, angle);
    perspectivep(angle);
    camera(look, up, position);
    translate(0.0, -3.25, 3.5);
    scale(3.25, 3.25, 3.25);
    rotateY(anirangleY);
    rotateX(anirangleX);

    DrawTriangle(Triangles);
}
function TextureStyle_Click(shading, texturing) {
    finalimageData = NewFrameBuffer(ctx, width, height);
    InitDisplay(ctx, finalimageData);
    interpolate = shading;
    textureMode = texturing

    reset();
    InitDisplay(ctx, finalimageData);
    toScreen(width, height, angle);
    perspectivep(angle);
    camera(look, up, position);
    translate(0.0, -3.25, 3.5);
    scale(3.25, 3.25, 3.25);
    rotateY(anirangleY);
    rotateX(anirangleX);

    DrawTriangle(Triangles);
}