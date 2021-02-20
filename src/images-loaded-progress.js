/*
@author Andrew Puig
[andrew.lpuig@gmail.com]
[andrewpuig.dev]

@description
This is a function that finds images with a given selector and waits for them to load before updating the progress bar that corresponds to the amount of images. So if 1 image loads then the progress bar goes to 100%. Might be useful with image heavy sites. It is recommended that you add the data.classes.invisibleClass to the images in the markup if possible and set the src of the images in data-images-loaded-src*=.
*/
var ImagesLoadedProgress = function(window, document, undefined){

    var data = {

        selectors: {
            // The images...
            image:    document.querySelectorAll("[data-images-loaded-src]"),
            // The progress bar
            progress: document.querySelector(".images-loaded-progress-bar")
        },

        classes: {
            // Add a class to the progress bar once it's complete.
            progressBarDoneClass: "images-loaded-progress-bar--done",
            /*
            This will be added to the image if it's not already there. It's recommended you add it in the markup whenever possible.
            */
            invisibleClass: "images-loaded--invisible",

            /*
            This will be added once the image has loaded and it ready to be seen.
            */
            visibleClass: "images-loaded--visible"
        },

        showProgressBarCount: true,

        /*
        The format of the text progress bar text. Index is the most recently loaded image and total is the total number of images.
        */
        progressBarCountFormat: "{index}/{total}",

        /*
        Determines whether to update the aria-valuenow attr on the progress bar for better accessibility.
        */
        updateAriaNow: true,

        _progressBarUpdateBy: 0,
        _progressBarLevel:    0,
        _progressBarAnimationFrame: undefined,
        _progressBarCountText: "",
        _imageCount: 0,
        _currentImageCount: 0,
        _cb = undefined
    };

    function _gatherImages(){

        var images = data.selectors.image,
            src = "";

        // Update the global image count.
        data._imageCount = images.length;

        // If there's no images, stop.
        if(!data._imageCount){
            return false;
        }

        /*
        100% / #images. This is to used get the percent by which we increment the progress bar.
        */
        data._progressBarUpdateBy = 100 / data._imageCount;

        for(var i = 0, l = data._imageCount; i < l; i++){

            // Set the src of the image to the data-images-loaded-src or src attr on the matched image.
            src = images[i].getAttribute("data-images-loaded-src") || images[i].getAttribute("src");

            if(src){
                // Load the images.
                loadImage(images[i], src, i);
            } else {
                /*
                If the src and data-images-loaded-src attrs are missing log an error. We don't know where else to look.
                */
                console.error("Cannot find src for image: " + images[i]);
            }

        }

    }

    /*
    @param {object} image - A image element that we will load the src to.
    @param {string} src - The src of the image element that was passed along.
    */
    function loadImage(image, src){

        if(image && src){

            var tempImg;

            /*
            If the image isn't already invisible, add the invisible class to hide its loading progress.
            */
            if(!image.classList.contains(data.classes.invisibleClass)){
                image.classList.add(data.classes.invisibleClass);
            }

            // Create a temp new image for each image.
            tempImg = new Image();

            // Set the src of the tempImg to begin loading.
            tempImg.src = src;

            /*
            When the tempImg loads, remove/add classes to the corresponding image in the DOM and then set the src to show the image.
            */
            tempImg.onload = function(){

                image.classList.remove(data.classes.invisibleClass);
                image.classList.add(data.classes.visibleClass);
                image.src = tempImg.src;

                /*
                Update the level of the progress bar by incrementing it by the quotient of 100 / #images.
                */
                data._progressBarLevel += data._progressBarUpdateBy;

                /*
                Upate the global current image index with i once the image loads. +1 because we want counting numbers.
                */
                if(data.showProgressBarCount){
                    data._currentImageCount = data._currentImageCount + 1;
                }

                // Do the visual update.
                updateProgressBar(data._progressBarLevel);

            };

        } else {
            console.error("Cannot load an image. Missing image or src param");
        }

    }

    /*
    @param {number} value - The percent value we will update the visual progress bar to.
    */
    function updateProgressBar(value){

        if(typeof(value) === "number"){

            // Cancel the animation frame before starting it again.
            cancelAnimationFrame(data._progressBarAnimationFrame);

            // Request an available frame to smooth the transition.
            data._progressBarAnimationFrame = requestAnimationFrame(function(){

                // Update the progress bar's width.
                data.selectors.progress.style.width = value + "%";

                // Check if the user wants us to update the count.
                if(data.showProgressBarCount){

                    // Replace the placeholder text with the actual values.
                    data._progressBarCountText = data.progressBarCountFormat.replace("{index}", data._currentImageCount).replace("{total}", data._imageCount);

                    // Update the visual text.
                    data.selectors.progress.innerText = data._progressBarCountText;

                }

                // Update the aria-valuenow attr.
                if(data.updateAriaNow){
                    data.selectors.progress.setAttribute("aria-valuenow", value);
                }

                // If it's at the max, add the progress bar done class.
                if(Math.round(value) === 100){
                    data.selectors.progress.classList.add(data.classes.progressBarDoneClass);
                    _cb();
                }

            });

        } else {
            console.error("Cannot update the progress bar, value param isNaN.");
        }

    }

    function init(cb){
        if(typeof(cb) === "function"){
            _cb = cb;
        }
        _gatherImages();
    }

    return{
        init: init,
        loadImage: loadImage,
        updateProgressBar: updateProgressBar
    };

}(window, document, undefined);
