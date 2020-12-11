var current_dir;
var canvas;
var dir_canvas;
var counter;
var max_elements;
var input;

/*
    MAIN OBJECT CONTROLLER FOR THE BROWSER:
    This object will have the functions for create all the elements of the visual browser.
 */
var browser = {
    create: function (target_div_id, max_element_per_row, file_input_id){
        current_dir = '/';
        canvas = document.getElementById(target_div_id);
		max_elements = (max_element_per_row != null) ? max_element_per_row : 8;
		input = document.getElementById(file_input_id);
    },
    reload: function (){
        if(canvas){
            canvas.html("");
            canvas.html('<div class="row">');
        }else{
            exception.canvas.notFoundException();
        }        
    },
    item:{       
        toggle: function (element) {
            var selected = $(element).hasClass('selected');
            if (selected) {
                $(element).removeClass('selected');
                $(element).css('background-color', 'white');
            } else {
                $(element).addClass('selected');
                $(element).css('background-color', 'lightskyblue');
            }
        },
        update: function(controller_method_url, dataset){
             $.ajax({
                url: controller_method_url,
                type: "GET",
                data: dataset,
                success: function(data) {
                    browser.reload();
                    var dir_array = data[0].split('/');
                    var dir = "";
                    for (var x = 0; x < dir_array.length - 1; x++) {
                        dir += dir_array[x] + "\\\\";
                    }
                    for (var x = 1; x < data.length; x++) {
                        var item = data[x].split('.');
                        if (item.length > 1) {
                            browser.element.create(item[0], item[1], dir + item[0] + "." + item[1], canvas);
                        } else {
                            browser.folder.create(item[0], canvas);
                        }
                    }
                },
                error: function(err) {
                    console.log(err);
                }
            });
        },
        erase_files: function(controller, dataset, item){
              $.ajax({
                url: controller_method_url,
                type: "GET",
                data: dataset,
                success: function(data) {
                    getElementsFromCurrentFolder();
                },
                error: function(err) {
                    console.exception(err);
                }
            });
        }
    },
    element: {
        create: function(title, format, route) {
            var bg;
            var icon;
            switch (format.trim().toLowerCase()) {
                case 'pdf':
                    bg = 'pdf-bg';
                    icon = 'fa-file-pdf-o';
                    break;
                case 'doc':
                case 'docx':
                case 'odt':
                case 'txt':
                    bg = 'doc-bg';
                    icon = 'fa-file-text';
                    break;
                case 'xls':
                case 'csv':
                case 'xlsx':
                    bg = 'xls-bg';
                    icon = 'fa-file-excel-o';
                    break;
                case 'png':
                case 'jpg':
                case 'jpeg':
                case 'bmp':
                case 'gif':
                    bg = 'img-bg';
                    icon = 'fa-file-image-o';
                    break;
                case 'zip':
                case 'rar':
                    bg = 'zip-bg';
                    icon = 'fa-file-archive-o';
                    break;
                case 'mp3':
                case 'midi':
                case 'obb':
                case 'wav':
                case 'flac':
                    bg = 'msc-bg';
                    icon = 'fa-music';
                    break;
                case 'avi':
                case 'mp4':
                case 'mpeg':
                    bg = 'vid-bg';
                    icon = 'fa-film';
                    break;
                default:
                    bg = 'uknw-bg';
                    icon = 'fa-question';
                    break;
            }
            if (format != 'add') {
                var html = '<div class="col-sm-1" style="margin-left:1em; margin-right:1em;" onclick="browser.item.toggle(this)" id="' + title + '.' + format + '" ondblclick="location.href=\'' + route + '\'">' +
                    '<div class="row">' +
                    '<div class="col-lg-12 widget  ' + bg + '" style="text-align:center">' +
                    '<i class="fa ' + icon + ' fa-4x" aria-hidden="true"></i>' +
                    '</div> </div >' +
                    ' <div class="row">' +
                    '<div class="col-lg-12" style="text-align:center">' +
                    '<span>' + title + '.' + format + '</span>' +
                    '</div></div> </div >';
                if (canvas) {
                    if (counter < max_elements) {
                        counter++;
                        canvas.append(html);
                    } else {
                        counter = 0;
                        canvas.append('</div><div class="row">');
                        canvas.append(html);
                    }
                } else {
                 exception.canvas.notFoundException();
                }
            }
        },
        upload:{
            showUploadBox: function(upload_file_div, file_container, file_input){
                var div = $("#"+upload_file_div);
                var container = $("#"+file_container);
                
                 if (div.hasClass('showing')) {
                    div.css('display', 'none');
                    div.removeClass('showing');
                } else {
                    container.html('');
                    container.html('<input type="file" name="file" id="'+file_input+'">');
                    input.change(function() {
                        if (input[0].files.length > 0) {
                            var fd = new FormData();
                            var files = input[0].files[0];
                            fd.append('file', files);
                            uploadData(fd);
                        } else {
                            console.log("No file");
                        }
                    });
                    div.css('display', 'inherit');
                    div.addClass('showing');
                }
            },
        },
        erase: function(controller_method_url, dataset){
            var selected = $(".selected");
            for (var x = 0; x < selected.length; x++) {
                var item = selected[x].id;
                if (item.split(".").length > 1)
                    deleteFile(item);
                }
           
        },
    },
    folder: {
        create: function(title, route) {
            var bg = 'folder-bg';
            var html = '<div class="col-sm-1" style="margin-left:1em; margin-right:1em;" onclick="browser.item.toggle(this)" id="' + title + '" ondblclick="open_folder(\'' + title + '\')">' +
                '<div class="row">' +
                '<div class="col-lg-12 widget white-bg" style="text-align:center">' +
                '<i class="fa  fa-folder fa-5x" style="color:orange" aria-hidden="true"></i>' +
                '</div> </div >' +
                ' <div class="row">' +
                '<div class="col-lg-12" style="text-align:center">' +
                '<span>' + title + '</span>' +
                '</div></div> </div >';


            if (canvas) {

                if (counter < max_elements) {
                    counter++;
                    canvas.append(html);
                } else {
                    counter = 0;
                    canvas.append('</div><div class="row">');
                    canvas.append(html);
                }


            } else {
                 exception.canvas.notFoundException();
            }
        },
        open: function(route){
            current_dir += route + '/';
            getElementsFromCurrentFolder();
        },
        back: function(){
            var dirs = current_dir.split('/');
            current_dir = '/';
            for (var x = 0; x < dirs.length - 2; x++) {
                if (dirs[x] != '')
                current_dir += dirs[x] + '/';
            }
            getElementsFromCurrentFolder();
        },
        erase: function(controller_method_url, dataset){
             $.ajax({
                url: controller_method_url,
                type: "GET",
                data: dataset,
                success: function(data) {
                    getElementsFromCurrentFolder();
                },
                error: function(err) {
                    console.exception(err);
                }
            });
        },
    }
};

var exception = {
    create: function(title, description, tips){
        console.exception(title + ':', description);
        if(tips){
            console.group("Tips");
            for(var x = 0; x < tips.length; x++){
                console.warn(tips[x]);
            }
            console.groupEnd();
        }
    },
    canvas: {
                canvasNotFoundException: function(){
                    exception.create("CanvasNotFoundException", "Undefined canvas object.", ["Check if your canvas has been created properly"]);
            },
        },
    }

var ajax = {}


$(document).on("drop dragend dragstart dragenter dragleave drag dragover", function(event) {
    event.preventDefault();
    if (event.type === 'drop') {
        var fd = new FormData();
        var files = event.originalEvent.dataTransfer.files[0];
        fd.append('file', files);
        $('.upload-area').css('background-color', 'White');
        $("#text").html("Subiendo...");
        uploadData(fd);
    }
});

$(document).ready(function() {
    browser.create('canvas', 8);
    loadCamps();
    $("#camp_selector").on('change', function(event) {
        getElementsFromCurrentFolder();
    });

    // preventing page from redirecting
    $("html").on("dragover", function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('.upload-area').css('background-color', 'White');
        $("#text").html("Arrástralo aquí");
    });

    //    $("html").on("drop", function (e) { e.preventDefault(); e.stopPropagation(); });

    // Drag enter
    $('.upload-area').on('dragenter', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('.upload-area').css('background-color', 'LightBlue');
        $("#text").html("Sueltalo");
    });

    // Drag over
    $('.upload-area').on('dragover', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('.upload-area').css('background-color', 'LightBlue');
        $("#text").html("Sueltalo");
    });

    // Open file selector on div click
    $("#uploadfile").click(function() {
        input.click();
    });

    // file selected
    input.change(function() {

        if (input[0].files.length > 0) {
            var fd = new FormData();
            var files = input[0].files[0];
            fd.append('file', files);
            uploadData(fd);
        } else {
            console.log("No file");
        }
    });
});

// Sending AJAX request and upload file
function uploadData(data, url_controller) {
    $.ajax({
        url: url_controller,
        type: "POST",
        data: function() {
                data.append("dir", current_dir)
            return data;
        }(),
        contentType: false,
        processData: false,
        success: function(response) {
            showUploadFile();

            getElementsFromCurrentFolder();


        },
        error: function(jqXHR, textStatus, errorMessage) {
            console.log(errorMessage);
        }
    });

}

// Added thumbnail
function addThumbnail(data) {
    $("#uploadfile h1").remove();
    var len = $("#uploadfile div.thumbnail").length;

    var num = Number(len);
    num = num + 1;

    var name = data.name;
    var size = convertSize(data.size);
    var src = data.src;

    // Creating an thumbnail
    $("#uploadfile").append('<div id="thumbnail_' + num + '" class="thumbnail"></div>');
    $("#thumbnail_" + num).append('<img src="' + src + '" width="100%" height="78%">');
    $("#thumbnail_" + num).append('<span class="size">' + size + '<span>');

}

// Bytes conversion
function convertSize(size) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (size == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
    return Math.round(size / Math.pow(1024, i), 2) + ' ' + sizes[i];
}


function createFolder(str, url_controller) {
    $.ajax({
        url: url_controller,
        type: "GET",
        data: {
            dir: current_dir,
            camp: $("#camp_selector").val(),
            folder: str
        },
        success: function(data) {
            getElementsFromCurrentFolder()
        },
        error: function(err) {
            console.log(err);
        }
    });
}



function callDeleteFolder() {
    var selected = $(".selected");
    for (var x = 0; x < selected.length; x++) {
        var item = selected[x].id;
        if (item.split(".").length == 1)
            deleteFolder(item);
    }
}


function callDeleteFile() {
    var selected = $(".selected");
    for (var x = 0; x < selected.length; x++) {
        var item = selected[x].id;
        if (item.split(".").length > 1)
            deleteFile(item);
    }
}


function downloadFolder(route) {
    location.href = route;
}



function loadCamps(url_controller) {
    $.ajax({
        url: url_controller,
        type: "GET",
        data: {},
        success: function(data) {
            var txtHtml = '<option value="-1" selected disabled>-- Seleccione una campaña --</option>';
            for (var x = 0; x < data.length; x++) {
                txtHtml += '<option value="' + data[x].Id + '">' + data[x].Nombre + '</option>';
            }
            $("#camp_selector").html(txtHtml);
            $('.combobox').select2({
                width: 'resolve',
                placeholder: 'Seleccione una opción',
                theme: "bootstrap"

            });

        },
        error: function(err) {
            console.log(err);
        }
    });
}
