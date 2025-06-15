var loader = document.getElementById("load");
loader.style.display = "none";

const value = document.querySelector("#length");
const input = document.querySelector("#input-range");
var count;
 
count = input.value;
value.textContent = " Length: " + count;
input.addEventListener("input", (event) => {
    count = event.target.value;
    value.textContent = " Length: " + count;
});

function changeColor(){
    if(document.getElementById("BulletPoint").checked == true)
    {
        document.getElementById("formLabel").style.color="blue"
    }
    else
    {
        document.getElementById("formLabel").style.color="black"
    }
}

function disableText(){
    if(document.getElementById("fileInput").files.length == 0)
    {
        document.getElementById("inputText").disabled=false;
    }
    else
    {
        document.getElementById("inputText").disabled=true;

    }
    
}

document.getElementById("inputText").addEventListener("focus",function(){
    document.getElementById("fileInput").disabled=true;
})
document.getElementById("inputText").addEventListener("blur",function(){
    if(document.getElementById("inputText").value == "")
    {
         document.getElementById("fileInput").disabled=false;
    }
})
document.addEventListener("DOMContentLoaded", function () {
    const summarizeButton = document.getElementById("summarizeButton");
    summarizeButton.parentNode.insertBefore(fileInput, summarizeButton);

    document.getElementById("summarizeButton").addEventListener("click", function () {
        
        let inputText = document.getElementById("inputText").value.trim();
        let uploadedFile = document.getElementById("fileInput").files[0];

        loader.style.display = "block";
        document.getElementById("outputText").innerText = ""; 

        let formData = new FormData();
        formData.append("length", count);

        if (uploadedFile) {
            formData.append("file", uploadedFile);
        } else {
            let inputcount = inputText.split(/\s+/);
            document.getElementById("input-count").textContent = inputcount.length;
            formData.append("inputText", inputText);
        }

        fetch('/process', {
            method: "POST",
            body: formData
        })
        .then(response => response.text())
        .then(summary => {
            loader.style.display = "none";
            function display(summary){
                if(document.getElementById("BulletPoint").checked == true)
                    {
                        document.getElementById("outputText").textContent="";
                        var ul=document.createElement("ul");
                        var summArr=summary.split(".");
                        summArr.map(function(sentence){
                            var li=document.createElement("li");
                            li.textContent=sentence;
                            ul.appendChild(li)
                        })
                        document.getElementById("outputText").appendChild(ul);
                    }
                    else
                    {
                        document.getElementById("outputText").innerHTML=""
                        document.getElementById("outputText").innerText = summary; 

                }
            }
            display(summary);
            let outcount = summary.split(/\s+/);
            document.getElementById("output-count").textContent = outcount.length;
        })
        .catch(error => {
            loader.style.display = "none";
            console.error("Error:", error);
            alert("An error occurred while summarizing.");
        });
    });
});


