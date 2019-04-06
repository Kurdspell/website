
function kurdspellEditor(selector){
    
    var spellCheck = function (text, el){
        var word = text.split(" ");
        var newHTML = "";
        $.ajax({
            type: "GET",
            url: "https://kurdspell.azurewebsites.net/api/spell/"+text,
            success: function(response){
                $.each(word, function(index, value){   
                    newHTML += "<div class='other'>" + value + "&nbsp;</div>";
                });            
                $.each(response, function(errorIndex, error){
                    current = "<div class='other'>" + error.original + "&nbsp;</div>"
                    var re = new RegExp(current, 'g');
                    suggestionsHTML = ""
                    $.each(error.suggestions, function(suggestionIndex, suggestion){
                        suggestionsHTML += "<a href='#' data-error='error-"+error.original+"' class='suggestion-element' >"+suggestion +"</a><br>";
                    })
                    newHTML = newHTML.replace(re , `
                        <span data-suggestions='${error.suggestions.join(';')}' class='error error-${error.original} '
                            data-toggle="popover" 
                            title="پێشنیارەکان" 
                            data-placement="bottom"                                        
                            data-content="
                                ${suggestionsHTML}
                            "
                        > 
                        ${error.original}
                        </span> 
                    ` );
                }) 
                $(el).html(newHTML);
                
                var child = $(el).children();
                var range = document.createRange();
                var sel = window.getSelection();
                range.setStart(child[child.length - 1], 1);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                $(el)[0].focus(); 
                $('[data-toggle="popover"]').popover({
                    html:true
                })

            }
        });
    }
    var typingTimer;                //timer identifier
    var doneTypingInterval = 1000;  //time in ms, 5 second for example
    var $input = $(selector);
    $input.on('keyup', function () {
        clearTimeout(typingTimer);
        var s = this
        typingTimer = setTimeout(()=>doneTyping(s), doneTypingInterval);
    });
    $input.on('keydown', function () {
        clearTimeout(typingTimer);
    });
    function doneTyping (selector) {
        var text = $(selector).text().replace(/[\s]+/g, " ");
        spellCheck(text,selector)
    }
    $(document).on('click','.suggestion-element',function(){
        var text = $(this).text()
        var err = $(this).data('error')
        $("."+err).html(text)
        $('.popover').remove()
        $("."+err).addClass('other').removeClass('error')
    })
        
}

