import React, { Component } from "react";
import "ide.css";


export default class IDEComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: ``,
      output: ``,
      language_id: 76,
      user_input: ``,
    };
  }
  componentDidMount() {
    document.getElementById('source').addEventListener('keydown', function(e) {
      if (e.key == 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;
    
        this.value = this.value.substring(0, start) +
          "\t" + this.value.substring(end);
    
        this.selectionStart =
          this.selectionEnd = start + 1;
      }
    });
  }
  input = (event) => {
    event.preventDefault();
    this.setState({ input: event.target.value });
  };
  userInput = (event) => {
    event.preventDefault();
    this.setState({ user_input: event.target.value });
  };
  language = (event) => {
    event.preventDefault();
    this.setState({ language_id: event.target.value });
  };

  submit = async (e) => {
    e.preventDefault();
    let outputText = document.getElementById("output");
    outputText.innerHTML = "";
    if(this.state.input === '') {
      outputText.innerHTML = "Text Editor is empty"
    }else {
    outputText.innerHTML += "Creating Submission ...\n";
    const response = await fetch(
      "https://judge0.p.rapidapi.com/submissions",
      {
        method: "POST",
        headers: {
          "x-rapidapi-host": "judge0.p.rapidapi.com",
          "x-rapidapi-key": "API KEY", 
          "content-type": "application/json",
           accept: "application/json",
        },
        body: JSON.stringify({
          source_code: this.state.input,
          stdin: this.state.user_input,
          language_id: this.state.language_id,
        }),
      }
    );
    outputText.innerHTML += "Submission Created ...\n";
    const jsonResponse = await response.json();

    let jsonGetSolution = {
      status: { description: "Queue" },
      stderr: null,
      compile_output: null,
    };

    while (
      jsonGetSolution.status.description !== "Accepted" &&
      jsonGetSolution.stderr == null &&
      jsonGetSolution.compile_output == null
    ) {
      outputText.innerHTML = `Creating Submission ... \nSubmission Created ...\nChecking Submission Status\nstatus : ${jsonGetSolution.status.description}`;
      if (jsonResponse.token) {
        let url = `https://judge0.p.rapidapi.com/submissions/${jsonResponse.token}?base64_encoded=true`;

        const getSolution = await fetch(url, {
          method: "GET",
          headers: {
            "x-rapidapi-host": "judge0.p.rapidapi.com",
            "x-rapidapi-key": "API KEY", 
            "content-type": "application/json",
          },
        });

        jsonGetSolution = await getSolution.json();
      }
    }
    if (jsonGetSolution.stdout) {
      const output = atob(jsonGetSolution.stdout);

      outputText.innerHTML = "";

      outputText.innerHTML += `Results : ${output}\nExecution Time : ${jsonGetSolution.time} Secs\nMemory used : ${jsonGetSolution.memory} bytes`;
    } else if (jsonGetSolution.stderr) {
      const error = atob(jsonGetSolution.stderr);

      outputText.innerHTML = "";

      outputText.innerHTML += `\n Error :${error}`;
    } else {
      const compilation_error = atob(jsonGetSolution.compile_output);

      outputText.innerHTML = "";

      outputText.innerHTML += `\n Error :${compilation_error}`;
    }
  
  }

  };
  render() {
    return (
      <>
        <div className="row container-fluid">
          <div className="col-6 ml-4 ">
            <label id="ideLabel" for="solution ">
              Text Editor:
            </label>
            <br/>
            <textarea
              required
              name="solution"
              id="source"
              onChange={this.input}
              className=" source"
              placeholder={"Your Beautiful Code Goes Here..."}
            >  
            </textarea>
            <br/>
            <button
              type="submit"
              className={"runButton"}
              onClick={this.submit}
            >
              <i class="fas fa-running"></i> Run
            </button>
           
            <label for="tags" className="mr-1">
              <b className="heading">Language:</b>
            </label>
            <select
              value={this.state.language}
              onChange={this.language}
              id="tags"
              className="form-control form-inline mb-2 language"
            >
              <option value="76">C++ (Clang 7.0.1)</option>
              <option value="45">Assembly (NASM 2.14.02)</option>
              <option value="47">Basic (FBC 1.07.1)</option>
              <option value="53">C++ (GCC 8.3.0)</option>
              <option value="55">Common Lisp (SBCL 2.0.0)</option>
              <option value="60">Go (1.13.5)</option>
              <option value="61">Haskell (GHC 8.8.1)</option>
              <option value="63">JavaScript (Node.js 12.14.0)</option>
              <option value="70">Python (2.7.17)</option>
              <option value="71">Python (3.8.1)</option>
              <option value="73">Rust (1.40.0)</option>
              <option value="74">TypeScript (3.7.4)</option>
              <option value="75">C (Clang 7.0.1)</option>
              <option value="78">Kotlin (1.3.70)</option>
              <option value="83">Swift (5.2.3)</option>

            </select>
          </div>
          <br />
          <div className="col-5">
            <div>
              <span className="badge badge-info heading my-2 ">
                <label id="ideLabel">Console: </label> 
              </span> <br/>
              <textarea id="output" readOnly></textarea>
            </div>
          </div>
        </div>
        <br />
        <div className="mt-2 ml-5">
          <label id="ideLabel">Input(s) [optional]: </label>
          <br />
          <textarea id="input" onChange={this.userInput}></textarea>
        </div>
      </>
    );
  }
}