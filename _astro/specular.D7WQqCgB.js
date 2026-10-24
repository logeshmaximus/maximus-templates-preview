var e={lineColor:`#ffffff`,baseColor:`#525252`,intensity:1,idleIntensity:.35,shineSize:10,shineFade:34,thickness:1.2,glow:1,proximity:250},t=24,n=`#version 300 es
in vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`,r=`#version 300 es
precision highp float;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uRadius;
uniform float uPx;
uniform float uSpot;
uniform vec2 uEntry;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform vec2 uWindow;
uniform float uThickness;
uniform float uGlow;
out vec4 outColor;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float loopPosition(vec2 p, vec2 b, float r) {
  vec2 inner = b - r;
  float arc = 1.5707963 * r;
  float quarter = inner.x + inner.y + arc;
  vec2 a = abs(p);
  vec2 q = a - inner;
  float s = q.x > 0.0 && q.y > 0.0
    ? inner.y + atan(q.y, q.x) * r
    : (q.x > q.y ? min(a.y, inner.y) : inner.y + arc + inner.x - min(a.x, inner.x));
  if (p.x < 0.0) s = p.y >= 0.0 ? 2.0 * quarter - s : 2.0 * quarter + s;
  else if (p.y < 0.0) s = 4.0 * quarter - s;
  return s / max(4.0 * quarter, 0.0001);
}

float lobe(float position, float center) {
  float gap = abs(fract(position - center + 0.5) - 0.5);
  return 1.0 - smoothstep(uWindow.x, uWindow.x + uWindow.y, gap);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = roundedBox(p, uHalf, uRadius);
  float position = loopPosition(p, uHalf, uRadius);
  float key = lobe(position, uSpot);
  float back = lobe(position, uSpot + 0.5);
  float streak = key + back * 0.45;
  float width = max(uThickness * uPx * mix(1.0, max(key, back), 0.6), 0.35);
  float band = smoothstep(-width - 0.6, -width + 0.6, d) * (1.0 - smoothstep(-0.6, 0.6, d));
  float hair = smoothstep(-uPx - 0.6, -uPx + 0.6, d) * (1.0 - smoothstep(-0.6, 0.6, d));
  float inside = 1.0 - smoothstep(-0.6, 0.6, d);
  vec2 pool = (p - uEntry) / (uHalf.y * vec2(1.6, 1.1));
  float glow = streak * 0.2 * exp(-abs(d + width * 0.5) / (5.0 * uPx)) + inside * 0.08 * exp(-dot(pool, pool));
  float light = clamp((band * streak + glow * uGlow) * uIntensity, 0.0, 1.0);
  vec4 base = vec4(uBaseColor, 1.0) * hair * 0.6;
  outColor = vec4(uLineColor, 1.0) * light + base * (1.0 - light);
}`,i=[`uCenter`,`uHalf`,`uRadius`,`uPx`,`uSpot`,`uEntry`,`uLineColor`,`uBaseColor`,`uIntensity`,`uWindow`,`uThickness`,`uGlow`],a=(e,t,n)=>Math.min(n,Math.max(t,e)),o=e=>e-Math.floor(e),s=(e,t,n,r,i)=>{let a=n-i,s=r-i,c=Math.PI/2*i,l=a+s+c,u=Math.abs(e),d=Math.abs(t),f=u-a,p=d-s,m;return m=f>0&&p>0?s+Math.atan2(p,f)*i:f>p?Math.min(d,s):s+c+a-Math.min(u,a),e<0?m=t>=0?2*l-m:2*l+m:t<0&&(m=4*l-m),o(m/Math.max(4*l,1e-4))},c=(e,t,n,r)=>{let i=t-r,a=n-r,s=Math.PI/2*r,c=i+a+s,l=o(e)*4*c,u=1,d=1;l>3*c?(l=4*c-l,d=-1):l>2*c?(l-=2*c,u=-1,d=-1):l>c&&(l=2*c-l,u=-1);let f=i-(l-a-s),p=n;if(l<=a)f=t,p=l;else if(l<=a+s){let e=(l-a)/Math.max(r,1e-4);f=i+Math.cos(e)*r,p=a+Math.sin(e)*r}return[f*u,p*d]},l=(e,t,n)=>{let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null},u=e=>{let t=l(e,e.VERTEX_SHADER,n),i=l(e,e.FRAGMENT_SHADER,r),a=e.createProgram();return!t||!i||!a?null:(e.attachShader(a,t),e.attachShader(a,i),e.bindAttribLocation(a,0,`aPosition`),e.linkProgram(a),e.deleteShader(t),e.deleteShader(i),e.getProgramParameter(a,e.LINK_STATUS)?a:(e.deleteProgram(a),null))},d={x:0,y:0,known:!1},f=new Set,p=!1,m=()=>{if(p)return;p=!0,addEventListener(`pointermove`,e=>{d.x=e.clientX,d.y=e.clientY,d.known=!0,f.forEach(e=>e())},{passive:!0});let e=e=>{e.pointerType!==`mouse`&&(d.known=!1,f.forEach(e=>e()))};addEventListener(`pointerup`,e,{passive:!0}),addEventListener(`pointercancel`,e,{passive:!0}),document.documentElement.addEventListener(`pointerleave`,()=>{d.known=!1,f.forEach(e=>e())})};function h(n,r={}){if(n.dataset.specular===`on`)return;let l={...e,...r},p=document.createElement(`canvas`);p.className=`sb-light`,p.setAttribute(`aria-hidden`,`true`);let h=p.getContext(`webgl2`,{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!h)return;let g=u(h);if(!g)return;n.dataset.specular=`on`;let _=document.createElement(`span`);for(_.className=`sb-label`;n.firstChild;)_.appendChild(n.firstChild);n.append(p,_),n.classList.add(`sb-on`);let v={};i.forEach(e=>v[e]=h.getUniformLocation(g,e));let y=h.createBuffer(),b=h.createVertexArray();h.bindVertexArray(b),h.bindBuffer(h.ARRAY_BUFFER,y),h.bufferData(h.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),h.STATIC_DRAW),h.enableVertexAttribArray(0),h.vertexAttribPointer(0,2,h.FLOAT,!1,0,0),h.bindVertexArray(null);let x=document.createElement(`canvas`).getContext(`2d`,{willReadFrequently:!0}),S=e=>{if(!x)return[1,1,1];x.clearRect(0,0,1,1),x.fillStyle=`#000`,x.fillStyle=e,x.fillRect(0,0,1,1);let[t,n,r]=x.getImageData(0,0,1,1).data;return[t/255,n/255,r/255]},C=S(l.lineColor),w=S(l.baseColor),T={width:1,height:1,ratio:1,radius:0},E={spot:0,level:0,press:0,ready:!1},D=0,O=0,k=!0,A=()=>Math.min(T.radius,T.width/2,T.height/2),j=()=>{let e=A(),t=e*(1-Math.SQRT1_2);return s(t-T.width/2,T.height/2-t,T.width/2,T.height/2,e)},M=()=>{if(!d.known)return null;let e=n.getBoundingClientRect(),t=e.width/T.width||1,r=T.width/2,i=T.height/2,c=(d.x-e.left-e.width/2)/t,u=(e.top+e.height/2-d.y)/t,f=Math.hypot(Math.max(Math.abs(c)-r,0),Math.max(Math.abs(u)-i,0)),p=a(1-f/l.proximity,0,1),m=p*p*(3-2*p),h=s(c,u,r,i,A());if(f>0)return{spot:h,near:m};let g=a(Math.min(r-Math.abs(c),i-Math.abs(u))/(i*.8),0,1),_=j()-c/r*.06-u/i*.02;return{spot:o(h+(_-h-Math.round(_-h))*g*g*(3-2*g)),near:m}},N=()=>{let{width:e,height:n}=T,r=p.width/(e+48),i=p.height/(n+48),a=A();h.viewport(0,0,p.width,p.height),h.clearColor(0,0,0,0),h.clear(h.COLOR_BUFFER_BIT),h.useProgram(g),h.uniform2f(v.uCenter,(t+e/2)*r,(t+n/2)*i),h.uniform2f(v.uHalf,e/2*r,n/2*i),h.uniform1f(v.uRadius,a*r),h.uniform1f(v.uPx,T.ratio);let[o,s]=c(E.spot,e/2,n/2,a),u=1-Math.min(n/2*.35,Math.hypot(o,s))/Math.max(Math.hypot(o,s),1e-4);h.uniform1f(v.uSpot,E.spot),h.uniform2f(v.uEntry,o*u*r,s*u*i),h.uniform3fv(v.uLineColor,C),h.uniform3fv(v.uBaseColor,w),h.uniform1f(v.uIntensity,l.intensity*(E.level+E.press*.8)),h.uniform2f(v.uWindow,l.shineSize/360+E.press*.06,l.shineFade/360+1e-4),h.uniform1f(v.uThickness,l.thickness),h.uniform1f(v.uGlow,l.glow),h.bindVertexArray(b),h.drawArrays(h.TRIANGLES,0,3),h.bindVertexArray(null)},P=e=>{if(D=0,!k)return;let t=O?Math.min(.05,(e-O)/1e3):1/60;O=e;let n=M();E.ready||=(E.spot=j(),E.level=l.idleIntensity,!0);let r=(n&&n.near>0?n.spot:j())-E.spot;r-=Math.round(r),E.spot=o(E.spot+r*(1-Math.exp(-t*8)));let i=l.idleIntensity+(1-l.idleIntensity)*(n?n.near:0);E.level+=(i-E.level)*(1-Math.exp(-t*7)),E.press*=Math.exp(-t*5),N(),Math.abs(r)>2e-4||Math.abs(i-E.level)>.001||E.press>.002?D=requestAnimationFrame(P):O=0},F=()=>{!D&&k&&(D=requestAnimationFrame(P))},I=()=>{T.width=Math.max(1,n.offsetWidth),T.height=Math.max(1,n.offsetHeight),T.ratio=Math.min(devicePixelRatio||1,3),T.radius=parseFloat(getComputedStyle(n).borderTopLeftRadius)||0,p.width=Math.max(1,Math.round((T.width+48)*T.ratio)),p.height=Math.max(1,Math.round((T.height+48)*T.ratio)),E.ready&&N(),F()};new ResizeObserver(I).observe(n),new IntersectionObserver(e=>{k=e.some(e=>e.isIntersecting),k&&(O=0,F())}).observe(n),n.addEventListener(`pointerdown`,e=>{d.x=e.clientX,d.y=e.clientY,d.known=!0,E.press=1,F()}),f.add(F),m(),I()}export{h as t};