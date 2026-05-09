/**
 * evacuation.js - نظام رسم مخططات الإخلاء المعمارية
 * يقوم هذا الملف برسم المخططات المعمارية، مسارات الهروب، ورموز السلامة على Canvas
 */

class EvacuationMap {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.options = Object.assign({
            wallColor: '#2c3e50',
            wallWidth: 3,
            roomColor: '#f8f9fa',
            textColor: '#2c3e50',
            escapePathColor: '#27ae60',
            escapePathWidth: 4,
            arrowSize: 10
        }, options);
        
        // مقاييس افتراضية
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawWall(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = this.options.wallColor;
        this.ctx.lineWidth = this.options.wallWidth;
        this.ctx.stroke();
    }

    drawRoom(x, y, w, h, name) {
        // رسم الغرفة
        this.ctx.fillStyle = this.options.roomColor;
        this.ctx.fillRect(x, y, w, h);
        this.ctx.strokeStyle = this.options.wallColor;
        this.ctx.lineWidth = this.options.wallWidth;
        this.ctx.strokeRect(x, y, w, h);

        // اسم الغرفة
        if (name) {
            this.ctx.fillStyle = this.options.textColor;
            this.ctx.font = 'bold 12px Cairo, Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(name, x + w / 2, y + h / 2 + 5);
        }
    }

    drawDoor(x, y, orientation = 'h', size = 30) {
        this.ctx.fillStyle = '#ffffff';
        if (orientation === 'h') {
            this.ctx.fillRect(x, y - 5, size, 10);
            this.ctx.strokeStyle = '#8e44ad';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y - 5, size, 10);
        } else {
            this.ctx.fillRect(x - 5, y, 10, size);
            this.ctx.strokeStyle = '#8e44ad';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x - 5, y, 10, size);
        }
    }

    drawWindow(x, y, orientation = 'h', size = 40) {
        this.ctx.fillStyle = '#3498db';
        if (orientation === 'h') {
            this.ctx.fillRect(x, y - 2, size, 4);
        } else {
            this.ctx.fillRect(x - 2, y, 4, size);
        }
    }

    drawEscapePath(points) {
        if (points.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.setLineDash([10, 5]);
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
            // رسم سهم عند كل نقطة (اختياري)
            if (i === points.length - 1) {
                this.drawArrow(points[i-1].x, points[i-1].y, points[i].x, points[i].y);
            }
        }
        
        this.ctx.strokeStyle = this.options.escapePathColor;
        this.ctx.lineWidth = this.options.escapePathWidth;
        this.ctx.stroke();
        this.ctx.setLineDash([]); // إعادة الخط المتصل
    }

    drawArrow(fromx, fromy, tox, toy) {
        const headlen = this.options.arrowSize;
        const angle = Math.atan2(toy - fromy, tox - fromx);
        this.ctx.beginPath();
        this.ctx.moveTo(tox, toy);
        this.ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(tox, toy);
        this.ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
        this.ctx.strokeStyle = this.options.escapePathColor;
        this.ctx.lineWidth = this.options.escapePathWidth;
        this.ctx.stroke();
    }

    drawSymbol(x, y, type, label) {
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        let symbol = '';
        let color = '#000';

        switch(type) {
            case 'exit': symbol = '❖'; color = '#27ae60'; break;
            case 'extinguisher': symbol = '◊'; color = '#e74c3c'; break;
            case 'assembly': symbol = '◼'; color = '#2980b9'; break;
            case 'alarm': symbol = '⬤'; color = '#f39c12'; break;
            case 'you_are_here': symbol = '★'; color = '#8e44ad'; break;
        }

        this.ctx.fillStyle = color;
        this.ctx.fillText(symbol, x, y);
        
        if (label) {
            this.ctx.font = '10px Cairo';
            this.ctx.fillText(label, x, y + 15);
        }
    }

    drawStairs(x, y, w, h, orientation = 'v') {
        this.ctx.strokeStyle = this.options.wallColor;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, w, h);
        
        if (orientation === 'v') {
            for (let i = 0; i < h; i += 10) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + i);
                this.ctx.lineTo(x + w, y + i);
                this.ctx.stroke();
            }
        } else {
            for (let i = 0; i < w; i += 10) {
                this.ctx.beginPath();
                this.ctx.moveTo(x + i, y);
                this.ctx.lineTo(x + i, y + h);
                this.ctx.stroke();
            }
        }
    }
}

// دالة لتهيئة المخططات المحددة
function initEvacuationPlans() {
    // 1. المبنى التعليمي - الدور الأرضي
    const academicG = new EvacuationMap('canvas-academic-ground');
    if (academicG.canvas) {
        academicG.clear();
        // الجدران الخارجية
        academicG.drawRoom(50, 50, 700, 300, 'المبنى التعليمي - الدور الأرضي');
        // الغرف
        academicG.drawRoom(50, 50, 150, 100, 'G-123 تقنية المعلومات');
        academicG.drawRoom(200, 50, 150, 100, 'G-125 شؤون الموظفات');
        academicG.drawRoom(350, 50, 250, 100, 'G-134 صالة متعددة');
        academicG.drawRoom(600, 50, 150, 100, 'G-030 بهو المسرح');
        
        academicG.drawRoom(50, 250, 150, 100, 'G-045 شؤون المتدربات');
        academicG.drawRoom(200, 250, 150, 100, 'G-132 المالية');
        
        // الممرات
        academicG.drawWall(50, 150, 750, 150);
        academicG.drawWall(50, 250, 750, 250);
        
        // الأبواب
        academicG.drawDoor(110, 150, 'h', 30);
        academicG.drawDoor(260, 150, 'h', 30);
        academicG.drawDoor(450, 150, 'h', 30);
        academicG.drawDoor(750, 200, 'v', 30); // مخرج طوارئ
        
        // السلالم
        academicG.drawStairs(650, 250, 100, 100, 'v');
        
        // مسار الإخلاء
        academicG.drawEscapePath([
            {x: 125, y: 100},
            {x: 125, y: 200},
            {x: 750, y: 200}
        ]);
        
        // الرموز
        academicG.drawSymbol(750, 215, 'exit', 'مخرج طوارئ');
        academicG.drawSymbol(400, 200, 'you_are_here', 'أنت هنا');
        academicG.drawSymbol(200, 200, 'extinguisher', 'مطفأة');
        academicG.drawSymbol(600, 200, 'alarm', 'جرس إنذار');
    }

    // 2. المبنى التعليمي - الدور الأول
    const academicF = new EvacuationMap('canvas-academic-first');
    if (academicF.canvas) {
        academicF.clear();
        academicF.drawRoom(50, 50, 700, 300, 'المبنى التعليمي - الدور الأول');
        academicF.drawRoom(50, 50, 150, 100, 'F-099 رئيسة القسم');
        academicF.drawRoom(200, 50, 150, 100, 'F-093 مكتب مدربات');
        academicF.drawRoom(350, 50, 150, 100, 'F-094 مكتب مدربات');
        
        academicF.drawStairs(650, 50, 100, 100, 'v');
        
        academicF.drawEscapePath([
            {x: 125, y: 100},
            {x: 125, y: 200},
            {x: 650, y: 200},
            {x: 650, y: 100}
        ]);
        
        academicF.drawSymbol(650, 100, 'exit', 'إلى السلالم');
        academicF.drawSymbol(300, 200, 'you_are_here', 'أنت هنا');
    }

    // 3. مبنى الخدمات - الدور الأرضي
    const serviceG = new EvacuationMap('canvas-service-ground');
    if (serviceG.canvas) {
        serviceG.clear();
        serviceG.drawRoom(50, 50, 700, 300, 'مبنى الخدمات - الدور الأرضي');
        serviceG.drawRoom(50, 50, 200, 150, 'المطعم');
        serviceG.drawRoom(250, 50, 200, 150, 'المغسلة');
        serviceG.drawRoom(450, 50, 300, 150, 'المستودع الرئيسي');
        
        serviceG.drawDoor(400, 350, 'h', 50); // مخرج رئيسي
        
        serviceG.drawEscapePath([
            {x: 150, y: 150},
            {x: 150, y: 250},
            {x: 400, y: 250},
            {x: 400, y: 350}
        ]);
        
        serviceG.drawSymbol(400, 370, 'exit', 'مخرج');
        serviceG.drawSymbol(800, 400, 'assembly', 'نقطة التجمع');
    }
}

document.addEventListener('DOMContentLoaded', initEvacuationPlans);
