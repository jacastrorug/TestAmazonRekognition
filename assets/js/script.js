$(function(){
	
	AWS.config.region = 'us-east-1'; // Region
    AWS.config.credentials = new AWS.Credentials('AKIAJUGW3WWDQ72BOY2A', '9OieAsykGMyVXeLkdx5ZevzTCTcHxTjdgxFVK9fo');
	var rekognition = new AWS.Rekognition();
	var dropbox = $('#dropbox'),
		message = $('.message', dropbox),
		index = 0;
	
	dropbox.filedrop({
		// The name of the $_FILES entry:
		paramname:'pic',
		
		maxfiles: 1000,
    	maxfilesize: 2,
		url: 'post_file.php',
		
		uploadFinished:function(i,file,response){
			$.data(file).addClass('done');
			// response is the JSON object that post_file.php returns
		},
		
    	error: function(err, file) {
			switch(err) {
				case 'BrowserNotSupported':
					showMessage('Your browser does not support HTML5 file uploads!');
					break;
				case 'TooManyFiles':
					alert('Too many files! Please select 5 at most! (configurable)');
					break;
				case 'FileTooLarge':
					alert(file.name+' is too large! Please upload files up to 2mb (configurable).');
					break;
				default:
					break;
			}
		},
		
		// Called before each upload is started
		beforeEach: function(file){

			console.log(file);

			var reader = new FileReader();
			reader.addEventListener('load', function(event){
				
				var dataUrl = event.target.result;
				var base64Image = dataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
				var imageBytes = getBinary(base64Image);

				var paramsImg = {
					CollectionId: 'prueba2',
					Image: {
						Bytes: imageBytes
					},
					DetectionAttributes: [],
					ExternalImageId: file.name
				};

				
				rekognition.indexFaces(paramsImg, function(err, data){
					console.log(err, data);
					listFaces('prueba2');
				});
				

			});

			reader.readAsDataURL(file);

			if(!file.type.match(/^image\//)){
				alert('Only images are allowed!');
				
				// Returning false will cause the
				// file to be rejected
				return false;
			}
		},
		
		uploadStarted:function(i, file, len){
			createImage(file);
		},
		
		progressUpdated: function(i, file, progress) {
			$.data(file).find('.progress').width(progress);
		}
    	 
	});
	
	var template = '<div class="preview">'+
						'<span class="imageHolder">'+
							'<img />'+
							'<span class="uploaded"></span>'+
						'</span>'+
						'<div class="progressHolder">'+
							'<div class="progress"></div>'+
						'</div>'+
					'</div>';

	function getBinary(base64Image) {
		
		var binaryImg = atob(base64Image);
		var length = binaryImg.length;
		var ab = new ArrayBuffer(length);
		var ua = new Uint8Array(ab);
		for(var i = 0; i < length; i++){
			ua[i] = binaryImg.charCodeAt(i);
		}

		return ab;
	}
	
	function createImage(file){

		var preview = $(template), 
			image = $('img', preview);
			
		var reader = new FileReader();
		
		image.width = 100;
		image.height = 100;
		
		reader.onload = function(e){
			
			// e.target.result holds the DataURL which
			// can be used as a source of the image:
			
			image.attr('src',e.target.result);
		};
		
		// Reading the file as a DataURL. When finished,
		// this will trigger the onload function above:
		reader.readAsDataURL(file);
		
		message.hide();
		preview.appendTo(dropbox);
		
		// Associating a preview container
		// with the file, using jQuery's $.data():
		
		$.data(file,preview);
	}

	function showMessage(msg){
		message.html(msg);
	}

});