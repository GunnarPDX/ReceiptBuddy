import React, {Component} from "react";
import './receipts.css'

import Dropzone from "react-dropzone";
import axios from 'axios';
import {Link} from "react-router-dom";

class ReceiptsIndex extends Component {


    state = {
        receipts: [],
        image: '',
        image_file: null,
        image_preview: null,
    };

    componentDidMount() {
        const token = localStorage.getItem('access-token');
        const client = localStorage.getItem('client');
        const uid = localStorage.getItem('uid');
        axios.get(`/api/v1/receipts`, {
            headers: {'Content-Type': 'application/json', 'access-token' : token, 'client':client, 'uid': uid}
        })
            .then(data => data)
            .then(data => {
                console.log(data);
                this.setState({
                    receipts: data.data,
                })
            })
            .catch(function(err) {
                console.log(err);
            });
    }

    onDrop = (files) => {
        window.URL.revokeObjectURL(this.state.image_preview);
        this.setState({ image_file: files[0], image_preview: URL.createObjectURL(files[0])  });
        //console.log(this.state.image_file.path);
    };

    showFilePreview() {
        const previewStyle = {
            height: '400px',
        };

        let file = this.state.image_preview || null;

        if (file === null) {
            return null;
        }

        return (
            <div className={"post-image-upload-overlay"}>
                <img
                    alt="Preview"
                    src={file}
                    style={previewStyle}
                />
            </div>
        );
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.setState({loading: 'true'});

        const { image_file } = this.state;
        let currentComponent = this;

        const formData = new FormData();
        formData.append('file', image_file);
        formData.append('upload_preset', 'r2rutyz6');

        axios.post(`https://api.cloudinary.com/v1_1/dmqtrnawm/image/upload`, formData,)
            .then(function(response) {
                const image = response.data.public_id;
                currentComponent.setState({image: image});

                const token = localStorage.getItem('access-token');
                const client = localStorage.getItem('client');
                const uid = localStorage.getItem('uid');
                axios.post('/api/v1/receipts',
                    {receipt: {image: currentComponent.state.image}},
                    {headers: {'Content-Type': 'application/json', 'access-token': token, 'client': client, 'uid': uid}}
                )
                    .then(resp => {
                        console.log(resp);
                    })
                    .then(resp => {
                        currentComponent.setState({loading: 'success'});
                        window.location.reload(false);
                        //currentComponent.props.history.push('/');
                    });
            });
    };

    contentBoxStyle = {
        width: '90%',
    };

    receiptImgStyle = {
        height: '300px',
    };

    renderReceipts = () => {
        if (this.state.receipts === undefined) {return null}
        else return this.state.receipts.map(receipt => {
            return (
                <li key={receipt.id} className={'post-container'}>
                    <img src={'https://res.cloudinary.com/dmqtrnawm/image/upload/' + receipt.image + '.png'} alt={'receipt photo'} style={this.receiptImgStyle}/>
                    <h3>Total: ${receipt.total}</h3>
                    <h3>Date: {receipt.date}</h3>
                </li>
            )
        })
    };

    render() {
        console.log(this.state.receipts);

        return (
            <div className={""}>
                <div className={""}/>
                <Link to={'/'} className={'standard-button'}> Return to Home </Link>
                <br/>

                <h1> Add A Receipt </h1>

                <div>
                    <Dropzone onDrop={this.onDrop}>
                        {({getRootProps, getInputProps}) => (
                            <section>
                                <div {...getRootProps()} className={'dropzone'}>
                                    <input {...getInputProps()} />

                                    <div className={"dropzone-text"}>
                                        Drag and drop some files here, or click to select files.
                                        <br/>
                                        [Max file size: ~4mb] larger files may fail to process
                                    </div>

                                    {this.showFilePreview()}

                                </div>
                            </section>
                        )}
                    </Dropzone>
                </div>

                <button onClick={this.handleSubmit} className={'standard-button'}>
                    Submit ( this may take a second... )
                </button>

                <br/>
                <br/>

                <h1> Processed Receipts </h1>

                <br/>

                <ul>
                {this.renderReceipts()}
                </ul>

                <br/>

            </div>
        )
    }


}

export default ReceiptsIndex;