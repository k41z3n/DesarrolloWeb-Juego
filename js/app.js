var grid = {
    columns: 7,
    rows: 7,
    cels: [],
};
var intervalTime
var playTime = 6*20*1000
var time = 0
var Matchs = [];
var gameover = false
var score = 0
var points = 0
var canMove = false;

$(document).ready(function () {
    $('.btn-reinicio').click(function () {
        Game.init();
        if (gameover == false) {
            $('.btn-reinicio').text('Reiniciar');
        } else {
            $('.btn-reinicio').text('Iniciar');
            $('.panel-tablero').show("slow");
            $('.time').show("slow");
            $('.panel-score').find('#gameOver').remove()
            $('.panel-score').animate({ width: '25%' }, "slow");
        }
        $('#movimientos-text').text('0');
        $('#score-text').text('0');
        intervalTime = setInterval(() => { startTimer()}, 1000);
    });
    AnimateTitle()
});
function AnimateTitle() {
    $(".main-titulo").animate({ color: '#ffffff' }, 250, function () {
        $(".main-titulo").animate({ color: '#DCFF0E' }, 250)
        AnimateTitle();
    });
}
function startTimer() {
    time+=1000;
    var distance = playTime-time
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    $('#timer').text(minutes+':'+seconds)
    if (distance <= 0) {
        clearInterval(intervalTime);
        $('#timer').text("02:00");
        Game.gameOver();
    }
}


var Game = {
    init: function () {
        self = this
        $('div[class^="col"]').empty()
        for (var i = 0; i < grid.columns; i++) {
            grid.cels[i] = [];
            for (var j = 0; j < grid.rows; j++) {
                grid.cels[i][j] = {
                    type: { type: 0, shift: 0 }
                }
            }
        }
        self.creategrid();
        self.setcanMove(false);
    },
    gameOver: function(){
        match = []
        time = 0
        score = 0
        points = 0
        gameover = true
        $('div[class^="col"]').empty()
        $(".main-container").removeClass("disabled")
        $('.btn-reinicio').text('iniciar');
        $('.panel-tablero').hide("slow");
        $('.time').hide("slow");
        $('.panel-score').animate({ width: '100%' }, "slow");
        $('<h1 class="main-titulo" id="gameOver">Juego Terminado</h1>').prependTo('.panel-score')
    },
    setcanMove : function(val){
        canMove = val;
        if(canMove)
            $(".main-container").removeClass("disabled")
        else
            $(".main-container").addClass("disabled")
    },
    getcanMove(){
        return canMove;
    },
    creategrid: function () {
        self = this

        for (var i = 0; i < grid.columns; i++) {
            for (var j = 0; j < grid.rows; j++) {
                let spawnTime = Math.floor(Math.random() * 600) + 500;
                let randomcandy = Math.floor(Math.random() * 4) + 1
                let id = i + "" + randomcandy + "" + Math.floor(Math.random() * i) + j
                grid.cels[i][j].type = randomcandy
                $('<img id="' + id + '" src="image/' + randomcandy + '.png" class="Candy elemento" >')
                    .appendTo('.col-' + (i + 1))
                    .css({ 'position': 'relative', 'top': -1000 })
                    .animate({ top: 0 }, spawnTime)
            }
        }

        self.MakeDraggable()
        self.findMatchs();
    },
    MakeDraggable: function () {
        self = this
        $('.Candy').draggable({
            containment: "panel-tablero",
            revert: true,
            revertDuration: 300,
            grid: [90.8, 96],
            zIndex: 99,
        });
        $(".Candy").droppable({
            drop: function (event, ui) {
                if (!self.getcanMove()) return;

                let drag = $(ui.draggable).attr('id');
                let drop = event.target.id

                let pos = $(ui.draggable).position()
                let eq = $(ui.draggable).index()

                let candytop = $(ui.draggable).prev().attr('id')
                let candybottom = $(ui.draggable).next().attr('id')
                let candyizq = $(ui.draggable).parent().prev().find('.Candy:eq(' + eq + ')').attr('id')
                let candyder = $(ui.draggable).parent().next().find('.Candy:eq(' + eq + ')').attr('id')

                points += 1
                $('#movimientos-text').text(points.toString());

                if (drop == candytop || drop == candybottom || drop == candyizq || drop == candyder) {
                    
                    var Apos = $('#' + drag).index()
                    var Acol = $('#' + drag).attr('id').substr(0, 1)
                    var Atype = $('#' + drag).attr('src').substr(6, 1)
                    var Aimg = $('#' + drag).attr('src')
                    
                    var Bpos = $('#' + drop).index()
                    var Bcol = $('#' + drop).attr('id').substr(0, 1)
                    var Btype = $('#' + drop).attr('src').substr(6, 1)
                    var Bimg = $('#' + drop).attr('src')
                    
                    grid.cels[Acol][Apos].type = parseInt(Btype)
                    grid.cels[Bcol][Bpos].type = parseInt(Atype)
                    $('#' + drag).attr('src', Bimg)
                    $('#' + drop).attr('src', Aimg)
                    self.findMatchs(true);
                    if (Matchs.length <= 0){
                        
                        grid.cels[Acol][Apos].type = parseInt(Atype)
                        grid.cels[Bcol][Apos].type = parseInt(Btype)
                        $('#' + drag).attr('src', Aimg)
                        $('#' + drop).attr('src', Bimg)
                    }
                }


            }
        });
    },
    findMatchs: function () {
        self = this

        Matchs = []

        for (var j = 0; j < grid.rows; j++) {

            var matchlength = 1;
            for (var i = 0; i < grid.columns; i++) {
                var checkcluster = false;

                if (i == grid.columns - 1) {

                    checkcluster = true;
                } else {

                    if (grid.cels[i][j].type == grid.cels[i + 1][j].type &&
                        grid.cels[i][j].type != -1) {

                        matchlength += 1;
                    } else {

                        checkcluster = true;
                    }
                }


                if (checkcluster) {
                    if (matchlength >= 3) {

                        Matchs.push({
                            column: i + 1 - matchlength, row: j,
                            length: matchlength, horizontal: true
                        });
                    }

                    matchlength = 1;
                }
            }
        }

        for (var i = 0; i < grid.columns; i++) {

            var matchlength = 1;
            for (var j = 0; j < grid.rows; j++) {
                var checkcluster = false;

                if (j == grid.rows - 1) {

                    checkcluster = true;
                } else {

                    if (grid.cels[i][j].type == grid.cels[i][j + 1].type &&
                        grid.cels[i][j].type != -1) {

                        matchlength += 1;
                    } else {

                        checkcluster = true;
                    }
                }

                if (checkcluster) {
                    if (matchlength >= 3) {

                        Matchs.push({
                            column: i, row: j + 1 - matchlength,
                            length: matchlength, horizontal: false
                        });
                    }

                    matchlength = 1;
                }
            }
        }
        if (Matchs.length > 0){

            
            setTimeout(() => {
                self.removeMatchs()
            }, 1000);
        }else
            self.setcanMove(true);
    },
    removeMatchs: function () {
        self = this
        for (let i = 0; i < Matchs.length; i++) {
            const match = Matchs[i];
            var col = match.column
            var row = match.row
            
            score += 10 * match.length 
            $('#score-text').text(score.toString());

            if (match.horizontal) {///horizontales
                for (let i = 0; i < match.length; i++) {
                    grid.cels[col + i][row] = -1
                    $('div[class^="col"]').eq(col + i).find('.Candy').eq(row)
                        .fadeOut(100)
                        .fadeIn(100)
                        .fadeOut(100)
                        .fadeIn(100, function () { $(this).remove() });
                }
            } else {//verticales
                for (let i = 0; i < match.length; i++) {
                    grid.cels[col][row + i] = -1
                    $('div[class^="col"]').eq(col).find('.Candy').eq(row + i)
                        .fadeOut(100)
                        .fadeIn(100)
                        .fadeOut(100)
                        .fadeIn(100, function () { $(this).remove() });
                }
            }
        }
        setTimeout(() => {
            self.swapcels()
        }, 1000);
    },
    swapcels: function () {
        self = this
        for (let i = 0; i < grid.columns; i++) {
            for (let j = 0; j < grid.rows; j++) {
                if (grid.cels[i][j] == -1) {
                    let spawnTime = Math.floor(Math.random() * 1000) + 500;
                    let randomcandy = Math.floor(Math.random() * 4) + 1
                    let id = i + "" + randomcandy + "" + Math.floor(Math.random() * i) + j
                    let newCandy = { type: randomcandy }
                    grid.cels[i].splice(j, 1);
                    grid.cels[i].unshift(newCandy)

                    $('<img id="' + id + '" src="image/' + randomcandy + '.png" class="Candy elemento" >')
                        .prependTo('div[class^="col"]:eq(' + i + ')')
                        .css({ 'position': 'relative', 'top': -1000 })
                        .animate({ top: 0 }, spawnTime)
                }
            }
        }
        self.MakeDraggable()
        setTimeout(() => {
            console.warn(Matchs)
            if (Matchs.length > 0 ){
                self.findMatchs();
            }else
                self.setcanMove(true);

        }, 1000);
    }
}