import React from 'react'
import {View,Platform} from 'react-native'
import {Text} from '@ui-kitten/components'

import {replaceAt,splice,specialHTML} from '@pn/utils/Main'

const global_style={
    fontFamily:Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace',
    fontSize:14,
}

const multiplierLineHeight = 1.5

export const uChord=(text,func,html)=>{
    let hasChord= /(\b)(([A-G]((#?|b?|\d?)(\d?))?((sus|maj|min|aug|dim|add|m)(\d?))?)((?!\w)))((((\/)[A-G](#?|b?)?)?((sus|maj|min|aug|dim|add|m))?([A-G](#?|b?)?)?(\d?))|(\-{1,1}\d|\-\S+))?(\.+)?/g;
    let buffer=[];
    let pisah=text.split("\n");
    let spasi="\n";
    let sudah=[];
    let aa=0;
    while(aa < pisah.length) {
        let line=pisah[aa],linenum=aa,mat = line.match(hasChord);
        if(line.match(/^\#/)) {
            buffer.push("{c:"+line.slice(1)+"}");
        }
        if(mat) {
            let hasil=pisah[linenum+1],p=0,k,ind=0;
            if(typeof hasil !== 'undefined' && hasil.match(hasChord) || typeof hasil === 'undefined' || typeof hasil !== 'undefined' && hasil.length < 1) {
                hasil=line;
                mat.forEach(function(ch,i){
                    let li=hasil;
                    k = (i===0)?0:p+ind+1;
                    p = p + 2;
                    ind=(i===0)?ch.length+ind:ch.length+ind+1; // 1,5,7
                    var ha = replaceAt(hasil,k,"["+ch+"] ");
                    hasil=ha;
                });
                buffer.push(hasil);
            } else if(typeof hasil !== 'undefined' && !hasil.match(hasChord) && hasil.length > 0) {
                mat.forEach(function(ch,i){
                    let li=hasil;
                    var n = line.indexOf(ch,ind);
                    k = p+n;
                    p=p+ ch.length + 2;
                    ind=n+1;
                    var ha = splice(li,k,0,"["+ch+"]");
                    hasil=ha;
                });
                sudah.push(linenum+1);
                buffer.push(hasil);
            } else {
                buffer.push(line);
            }
        } else {
            if(sudah.indexOf(aa) == -1) {
                buffer.push(line);
            }
        }
        aa++;
    }
    if(typeof func==='function') {
        return func(buffer.join(spasi));
    }
    return buffer.join(spasi);
}

const transpose_chord = function( chord, trans ) {
    var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    var regex = /([A-Z][b#]?)/g;
    var modulo = function(n, m) {
            return ((n % m) + m) % m;
    };
    return chord.replace( regex, function( $1 ) {
        if( $1.length > 1 && $1[1] == 'b' ) {
            if( $1[0] == 'A' ) {
                $1 = "G#";
            } else {
                $1 = String.fromCharCode($1[0].charCodeAt() - 1) + '#';
            }
        }
        var index = notes.indexOf( $1 );
        if( index != -1 ) {
            index = modulo( ( index + trans ), notes.length );
            return notes[index];
        }
        return chord;
    });
};

export default React.memo(function({template,transpose=0,fontSize}){
    let lineHeight = multiplierLineHeight * fontSize;
    const chordregex= /\[([^\]]*)\]/;
    const inword    = /[a-z]$/;
    
    const ChordBuffer = React.useMemo(()=>{
        let chord;
        let IsiBuffer=[];

        if (!template || template.length===0) {
            return null
        }
    
        template.split("\n").forEach(function(line, linenum){
            const IsiLine=[];
            /* Comment, ignore */
            if (line.match(/^#/)) {
                return;
            }
            /* Chord line */
            if (line.match(chordregex) !== null) {
                const isi_chord=[];
                let lyrics = "";
                let chordlen = 0;
                let chords = "";

                line.split(chordregex).forEach(function(word, pos){
                    let dash = 0;

                    if ((pos % 2) != 0) {
                        /* Chords */
                        chord = word.replace(/[[]]/, "");
                        if(transpose !== false) {
                            chord = transpose_chord(chord, transpose);
                        }
                        chordlen = chord.length;
                        //chords = chords + '<span class="'+classes.chord+'" data-original-val="' + chord + '">' + chord + '</span>';
                        isi_chord.push({blank:specialHTML(chords||""),chord})
                        chords="";
                    } else {
                        lyrics = lyrics + word.replace(' ', "&nbsp;");
    
                        /*
                        * Whether or not to add a dash (within a word)
                        */
                        if (word.match(inword)) {
                            dash = 1;
                        }
    
                        /*
                        * Apply padding.  We never want two chords directly adjacent,
                        * so unconditionally add an extra space.
                        */
                        if (word && word.length < chordlen) {
                            chords = chords + "&nbsp;";
                            lyrics = (dash == 1) ? lyrics + "&nbsp;" : lyrics + "&nbsp;&nbsp;";
                            for (var i = chordlen - word.length - dash; i != 0; i--) {
                                lyrics = lyrics + "&nbsp;";
                            }
                        } else if (word && word.length == chordlen) {
                            chords = chords + "&nbsp;";
                            lyrics = (dash == 1) ? lyrics + " " : lyrics + "&nbsp;";
                        } else if (word && word.length > chordlen) {
                            for (var i = word.length - chordlen; i != 0; i--) {
                                chords = chords + "&nbsp;";
                            }
                        }
                    }
                },this)
                
                var cek=lyrics.match(/(?!nbsp\b)\b\w+/); //Cek ada lirik *null= tidak ada
                if( cek === null){
                    IsiLine.push(
                        {
                            type:'chord',
                            render:(
                                <View style={{flexDirection:'row'}}>
                                    {isi_chord?.map((ch,i)=>(
                                        <React.Fragment key={i}>
                                            {ch?.blank?.length > 0 && <Text key={`chord-${linenum}-row-chord-0-${i}-0`} style={{...global_style,fontSize:fontSize,lineHeight:lineHeight}}>{ch?.blank}</Text> }
                                            <Text key={`chord-${linenum}-row-chord-0-${i}-1`} style={{...global_style,fontSize:fontSize,fontWeight:'600',lineHeight:lineHeight}} status="info">{ch?.chord}</Text>
                                        </React.Fragment>
                                    ))}
                                </View>
                            )
                        }
                    )
                    //buffer.push('<span class="'+classes.line+'">' + chords + "</span><br/>");
                } else {
                    IsiLine.push(
                        {
                            type:"chord",
                            render:(
                                <>
                                    <View key={'view-0'} style={{flexDirection:'row'}}>
                                        {isi_chord?.map((ch,i)=>(
                                            <React.Fragment key={i}>
                                                {ch?.blank?.length > 0 && <Text key={`chord-${linenum}-row-chord-1-${i}-0`} style={{...global_style,fontSize:fontSize,lineHeight:lineHeight}}>{ch?.blank}</Text> }
                                                <Text key={`chord-${linenum}-row-chord-1-${i}-1`} style={{...global_style,fontSize:fontSize,fontWeight:'600',lineHeight:lineHeight}} status="info">{ch?.chord}</Text>
                                            </React.Fragment>
                                        ))}
                                    </View>
                                    <View key='view-1'>
                                        <Text selectable key={`chord-${linenum}`} style={{...global_style,fontSize:fontSize,lineHeight:lineHeight}}>{specialHTML(lyrics)}</Text>
                                    </View>
                                </>
                            )
                        }
                    )
                    //buffer.push('<span class="'+classes.line+'">' + chords + "<br/>\n" + lyrics + "</span><br/>");
                }
                IsiBuffer = IsiBuffer.concat(IsiLine)
                return;
            }

            /* Commands */
            if (line.match(/^{.*}/) !== null) {
                const matches = line.match(/^{(title|t|subtitle|st|comment|c|#):\s*(.*)}/, "i");
                if( matches?.length >= 3 ) {
                    let command = matches[1];
                    let text = matches[2];
                    let wrap_style=false;
                    switch( command ) {
                        case "title":
                        case "t":
                            wrap_style = {
                                fontSize:24,
                                fontWeight:'600'
                            };
                            break;
                        case "subtitle":
                        case "st":
                            wrap_style = {
                                fontSize:22,
                                fontWeight:'600'
                            };
                            break;
                        case "comment":
                        case "c":
                            wrap_style = {
                                fontStyle:'italic',
                                marginBottom:10
                            };
                            text = `[${text}]`
                            break;
                        case "#":
                            wrap_style = {}
                            text="#"+text;
                            break;
                    }

                    if(typeof wrap_style === 'object') {
                        IsiLine.push(
                            {
                                type:'command',
                                render:<Text selectable key={`command-${linenum}`} style={{...global_style,...wrap_style,...(['#','c','comment'].indexOf(command) !== -1 ? {fontSize:fontSize,lineHeight:lineHeight} : {})}}>{text}</Text>
                            }
                        )
                    }
                }
                IsiBuffer = IsiBuffer.concat(IsiLine)
                return;
            }
            IsiLine.push(
                {
                    type:'other',
                    render:<Text selectable key={`all-chord-${linenum}`} style={{...global_style,fontSize:fontSize,lineHeight:lineHeight}}>{line}</Text>
                }
            )
            IsiBuffer = IsiBuffer.concat(IsiLine)
        },this)
        return IsiBuffer
    },[template,transpose,fontSize])
    

    return (
        <View>
            {ChordBuffer?.map((buf,i)=>(
                <React.Fragment key={i}>
                    {/*Chord*/}
                    {buf?.type === 'chord' ? (
                        <View style={{flexDirection:'column'}}>
                            {buf?.render}
                        </View>
                    ) 
                    /* Command */
                    : buf?.type === 'command' ? (
                        <View style={{flexDirection:'column',marginVertical:5}}>
                            {buf?.render}
                        </View>
                    )
                    /* Other */
                    : (
                        <View style={{flexDirection:'column'}}>
                            {buf?.render}
                        </View>
                    )}
                </React.Fragment>
            ))}
        </View>
    )
})