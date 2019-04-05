
function kurdspellEditor(selector){
    $(selector).on("keyup", function(e){
        if (e.keyCode == 32){
            var text = $(this).text().replace(/[\s]+/g, " ");
            var word = text.split(" ");
            var newHTML = "";
            var el = this
            if(text.trim()!==""){

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
                                    suggestionsHTML += "<li>"+suggestion +"</li>";
                                })
                                newHTML = newHTML.replace(re , `
                                    <span data-suggestions='${error.suggestions.join(';')}' class='error'> 
                                        <p style="width: max-content;">${error.original}</p>
                                        <ul class="suggestion-box">
                                            ${suggestionsHTML}
                                        </ul>
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
                        }
                });           
            }
            
        }
    });
    $(selector).on('click','.error .suggestion-box li',function(){
        var text = $(this).text()
        var err = $(this).parents('.error')
        var p = $(err).find('p')
        console.log(err)
        $(p).html(text)
        $(this).parents('.suggestion-box').remove()
        $(err).addClass('other').removeClass('error')
    })
        
}
