/* Author:

*/
$(document).ready(function() {
    $(function(){

    var t = setInterval(function(){

        $('#iphone img.screenshot').last().fadeOut(4000,function(){ 
            $this = $(this);
            $parent = $this.parent();
            $this.remove().css('display','block');
            $parent.prepend($this);
        });

    },3000); // every 3 seconds
});
 });
