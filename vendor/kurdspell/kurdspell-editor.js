$(function(){
    /* 
        // i may need those 
        quill.insertText(5, 'Quill', {
            'color': '#ffff00',
            'italic': true
        });
        quill.setContents([
            { insert: 'Hello ' },
            { insert: 'World!', attributes: { bold: true } },
            { insert: '\n' }
        ]);
        quill.updateContents(new Delta()
            .retain(6)                  // Keep 'Hello '
            .delete(5)                  // 'World' is deleted
            .insert('Quill')
            .retain(1, { bold: true })  // Apply bold to exclamation mark
        );

        quill.setText('Hello\nWorld!\n');
        quill.formatText(0, 5, 'bold', true);      // bolds 'hello'
        quill.formatText(0, 5, {                   // unbolds 'hello' and set its color to blue
        'bold': false,
        'color': 'rgb(0, 0, 255)'
        });
        quill.formatText(5, 1, 'align', 'right');  // right aligns the 'hello' line


        // removing text format 
        quill.setContents([
            { insert: 'Hello', { bold: true } },
            { insert: '\n', { align: 'center' } },
            { insert: { formula: 'x^2' } },
            { insert: '\n', { align: 'center' } },
            { insert: 'World', { italic: true }},
            { insert: '\n', { align: 'center' } }
        ]);
        quill.removeFormat(3, 7);

        //  usefull when having tooltips

        quill.setText('Hello\nWorld\n');
        quill.getBounds(7);  // Returns { height: 15, width: 0, left: 27, top: 31 }

        var range = quill.getSelection();
        if (range) {
            if (range.length == 0) {
                console.log('User cursor is at index', range.index);
            } else {
                var text = quill.getText(range.index, range.length);
                console.log('User has highlighted: ', text);
            }
        } else {
            console.log('User cursor is not in editor');
        }

    */
    const Tooltip = Quill.import('ui/tooltip');
    var toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
      
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction
      
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],
      
        ['clean']                                         // remove formatting button
    ];
    var options = {
        debug: 'warn',
        modules: {
            // toolbar:toolbarOptions
            toolbar: false
        },
        placeholder: 'رستەیەک بنوسە...',
        readOnly: false,
        theme: 'snow'
    };
    var editor = new Quill('.editor', options);  // First matching element will be used
    editor.format('direction', 'rtl');
    editor.format('align', 'right');
    

    var typingTimer;                //timer identifier
    var doneTypingInterval = 1000;  //time in ms, 5 second for example

    editor.on('text-change', function(delta, oldDelta, source) {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(()=>doneTyping(editor), doneTypingInterval);        
    });
    var pop = addPopover("suggester");

    editor.on('selection-change', function(range, oldRange, source) {
        if (range) {
          if (range.length == 0) {
            // console.log('User cursor is on', range.index);
            $(pop).fadeOut(10)

          } else {
            var text = editor.getText(range.index, range.length);
            let myBounds = editor.getBounds(range.index, range.length);
            console.log(myBounds)
            var error = _.find(window.kurdspell,{ 'original': text.trim() })
            if(error){  
                $(pop).css('top',(myBounds.top+40)+"px").css('left',(myBounds.left-myBounds.width)+"px")
                var popBody = $(pop).find('.popover-body')[0]
                var suggestionsHtml = "";
                $(error.suggestions).each(function(){
                    suggestionsHtml+= "<a class='pick-suggestion' data-index='"+range.index+"' data-length='"+range.length+"' href='#'>"+this+"</a><br>";
                })
                $(popBody).html(suggestionsHtml)
                $(pop).fadeIn(300)
            }
            
          }
        } else {
        //   console.log('Cursor not in the editor');

        }        
    });
    $(document).on('click','.pick-suggestion',function(){
        var index = $(this).data('index')
        var length = $(this).data('length')
        var text = $(this).text()
        console.log(index,length,text)
    })
    function doneTyping (editor) {
        var text = editor.getText();
        if(text.trim()!=""){
            spellCheck(text,editor)
        }
        // console.log(delta)
        // console.log(editor.getContents())
    }

    var spellCheck = function (text, editor){
        $.ajax({
            type: "GET",
            url: "https://kurdspell.azurewebsites.net/api/spell/"+text,
            success: function(response){
                window.kurdspell = response
                $(response).each(function(){
                    editor.formatText(this.errorRange.from, (parseInt(this.errorRange.to)+1), {                   // unbolds 'hello' and set its color to blue
                        'bold': true,
                        // 'underline':true,
                        'color': 'rgb(255, 0, 0)'
                    });
                })
            }
        });
    }
    function addPopover (id){
        $('body').append(`
            <div id="${id}" style="position: absolute;display:none;text-align:right;" class="popover fade show bs-popover-left">
                <h3 class="popover-header">پێشنیارکراوەکان</h3>
                <div class="popover-body"> slaw jyhan</div>
            </div>
        `)
        return $("#"+id);
    }

})
